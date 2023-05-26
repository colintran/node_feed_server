const User = require('../models/user');
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
    .then(hashed => {
        const newUser = new User({
            email: email,
            password: hashed,
            name: name,
            posts: []
        });
        return newUser.save()
    })
    .then(user => {
        res.status(201).json({
            message: `User ${user.email} is created!`
        });
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
            err.message = 'Internal Server Error';
        }
        next(err);
    })
}

exports.login = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loggedUser;
    User.findOne({email: email})
    .then(user => {
        if (!user){
            const error = new Error('User not exists!');
            error.statusCode = 401;
            throw error;
        }
        loggedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(matched => {
        if (!matched){
            const error = new Error('User or password not correct!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            email: loggedUser.email,
            userId: loggedUser._id.toString()
        },'privateandsecretkey',
        {expiresIn: '1h'});
        return res.status(200).json({
            message: 'Authenticated',
            token: token,
            userId: loggedUser._id.toString()
        });
    })
    .catch(err => {
        if (!err.statusCode){
            err.statusCode = 500;
            err.message = 'Internal Server Error';
        }
        next(err);
    })
}

exports.getStatus = (req,res,next) => {
    return res.status(200).json({
        status: 200,
        message: 'Authenticated'
    });
}