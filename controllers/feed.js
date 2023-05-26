const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const fileHelper = require('../util/file');
const path = require('path');
const io = require('../socket');

const ITEMS_PER_PAGE = 20;
exports.getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page);
        console.log('One request come from: %o, page=%d', req.headers, page);
        let totalItems;
        let fetchedPosts;
        totalItems = await Post.find().count()
        fetchedPosts = await Post.find()
            .sort({createdAt: "desc"})
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        await Post.populate(fetchedPosts, { path: 'creator' });
        // console.log('fetchedPosts: %o', fetchedPosts);
        res.status(200).json({
            message: 'Posts retrieved successfully!',
            posts: fetchedPosts,
            totalItems: totalItems
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        let post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error; // it will go to catch part anyway   
        }
        post = await Post.populate(post, 'creator');
        res.status(200).json({
            message: 'Post retrieved succesfully',
            post: post
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.createPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, request message is invalid');
            error.statusCode = 422;
            throw error;
        }
        if (!req.file) {
            const error = new Error('No image file provided!');
            error.statusCode = 422;
            throw error;
        }
        let imageUrl = req.file.path;
        imageUrl = imageUrl.replace('\\', '/');
        let content = req.body.content;
        let title = req.body.title;
        let newPost = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId
        });
        await newPost.save();
        let user = await User.findById(req.userId);
        // add post to the post list of corresponding user
        if (!user) {
            const error = new Error('User not exist!');
            error.statusCode = 404;
            throw error;
        }
        user.posts.push(newPost);
        user = await user.save();
        // Inform other connected users via websocket
        // data structure is up to us
        io.getIO().emit('Posts', {
            action: 'create',
            post: {
                ...newPost,
                creator: {
                    _id: user._id,
                    name: user.name
                }
            }
        })
        res.status(201).json({
            message: 'Post created successfully!',
            post: newPost,
            creator: {
                _id: user._id,
                name: user.name
            }
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.updatePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        let post = await Post.findById(postId).populate('creator');
        if (!post) {
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error; // it will go to catch part anyway (so for what??)   
        }
        // only owner can edit post
        if (post.creator._id.toString() !== req.userId) {
            const error = new Error('Unauthorized to edit post');
            error.statusCode = 403;
            throw error;
        }
        // post found, update
        if (req.file) {
            fileHelper.deleteFile(path.join(__dirname, '..', post.imageUrl));
            post.imageUrl = req.file.path.replace('\\', '/');
        }
        post.content = req.body.content;
        post.title = req.body.title;
        post = await post.save();
        // use websocket to update other users as well
        io.getIO().emit('Posts', {
            action: 'update',
            post: post
        });
        res.status(200).json({
            message: 'Post updated succesfully',
            post: post
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        let post = await Post.findById(postId)
        // only owner can edit post
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Unauthorized to delete post');
            error.statusCode = 403;
            throw error;
        }
        // remove post from user post list
        let user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();
        await Post.findByIdAndDelete(postId);
        fileHelper.deleteFile(path.join(__dirname, '..', post.imageUrl));
        // use websocket to remove this post in other users feed
        io.getIO().emit('Posts', {
            action: 'delete',
            postId: postId
        })
        res.status(200).json({
            message: 'Post deleted!',
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}