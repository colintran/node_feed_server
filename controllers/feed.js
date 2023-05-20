const {validationResult} = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req,res,next) => {
    console.log('One request come from: %o',req.headers);
    Post.find()
    .then(posts => {
        res.status(200).json({
            message: 'Posts retrieved successfully!',
            posts: posts
        });
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
    let content = req.body.content;
    let title = req.body.title;
    // let imageUrl = req.body.imageUrl;
    let newPost = new Post({
        title: title,
        content: content,
        imageUrl: 'images/testudo.jpg',
        creator : {
            name: 'React'
        }
    });
    postList.push(newPost);
    newPost.save()
    .then(post => {
        return res.status(201).json({
            message: 'Post created successfully!',
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