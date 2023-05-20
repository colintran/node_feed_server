const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const feedRouter = require('./routes/feed');

const app = express();
app.use(bodyParser.json());
app.use('/images',express.static(path.join(__dirname,'images')));
// Init folders if not created
const fileUtil = require('./util/file');
fileUtil.initFolders();
// Lift CORS restriction
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed',feedRouter);
// error handling
app.use((error, req, res, next) => {
    console.log('Error got: %o',error);
    const status = error.statusCode;
    const message = error.message;
    res.status(status).json({
        message: message
    });
});
mongoose.connect('mongodb://localhost:27017/restapi')
.then(connectionOk => {
    app.listen(8080);
})
.catch(err => {
    console.log('Unable to start server, DB connection error: %o',err);
})