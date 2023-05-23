const {validationResult} = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const fileHelper = require('../util/file');
const path = require('path');

const ITEMS_PER_PAGE = 2;
exports.getPosts = (req,res,next) => {
    const page = parseInt(req.query.page);
    let totalItems;
    let fetchedPosts;
    console.log('One request come from: %o, page=%d',req.headers,page);
    Post.find()
    .count()
    .then(count => {
        totalItems = count;
        Post.find()
        .skip((page-1)*ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then(posts => {
            fetchedPosts = posts;
            return Post.populate(fetchedPosts, {path: 'creator'});
        })
        .then(result => {
            console.log('fetchedPosts: %o',fetchedPosts);
            res.status(200).json({
                message: 'Posts retrieved successfully!',
                posts: fetchedPosts,
                totalItems: totalItems
            });
        })
    })
    .catch(err => {
        const error = new Error('Internal Server Error');
        error.statusCode = 500;
        next(error);
    })
}

exports.getPost = (req,res,next) => {
    const postId = req.params.postId;
    Post.findById({_id: postId})
    .then(post => {
        if (!post){
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error; // it will go to catch part anyway (so for what??)   
        }
        res.status(200).json({
            message: 'Post retrieved succesfully',
            post: post
        });
    })
    .catch(err => {
        const error = new Error('Internal Server Error');
        error.statusCode = 500;
        next(error);
    })
}

exports.createPost = (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('Validation failed, request message is invalid');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file){
        const error = new Error('No image file provided!');
        error.statusCode = 422;
        throw error;
    }
    let imageUrl = req.file.path;
    imageUrl = imageUrl.replace('\\','/');
    let content = req.body.content;
    let title = req.body.title;
    let newPost = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator : req.userId
    });
    newPost.save()
    .then(post => {
        return User.findById(req.userId);
    })
    .then(user => {
        // add post to the post list of corresponding user
        if (!user){
            const error = new Error('User not exist!');
            error.statusCode = 404;
            throw error;
        }
        user.posts.push(newPost);
        return user.save();
    })
    .then(user => {
        return res.status(201).json({
            message: 'Post created successfully!',
            post: newPost,
            creator: {
                _id: user._id,
                name: user.name
            }
        });
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.updatePost = (req,res,next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if (!post){
            const error = new Error('Post not found!');
            error.statusCode = 404;
            throw error; // it will go to catch part anyway (so for what??)   
        }
        // only owner can edit post
        if (post.creator.toString() !== req.userId){
            const error = new Error('Unauthorized to edit post');
            error.statusCode = 403;
            throw error;
        }
        // post found, update
        if (req.file){
            fileHelper.deleteFile(path.join(__dirname,'..',post.imageUrl));
            post.imageUrl = req.file.path.replace('\\','/');
        }
        post.content = req.body.content;
        post.title = req.body.title;
        return post.save();
    })
    .then(post => {
        res.status(200).json({
            message: 'Post updated succesfully',
            post: post
        });
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.deletePost = (req,res,next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        // only owner can edit post
        if (post.creator.toString() !== req.userId){
            const error = new Error('Unauthorized to delete post');
            error.statusCode = 403;
            throw error;
        }
        // remove post from user post list
        return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save();
    })
    .then(user => {
        return Post.findByIdAndDelete(postId);
    })
    .then(post => {
        fileHelper.deleteFile(path.join(__dirname,'..',post.imageUrl));
        res.status(200).json({
            message: 'Post deleted!',
        });
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}