const {validationResult} = require('express-validator');
const Post = require('../models/post');

const postList = [];
exports.getFeeds = (req,res,next) => {
    console.log('One request come from: %o',req.headers);
    return res.status(200).json({
        posts: [{
            _id : '1',
            title: 'The first post',
            content: 'Something absurd and nonsense ^^',
            imageUrl: 'images/Testudo.jpg',
            creator : {
                name: 'Trand'
            },
            createdAt: new Date()
        }]
    });
}

exports.postFeed = (req,res,next) => {
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