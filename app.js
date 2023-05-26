const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const io = require('./socket');

const multer = require('multer');
// Upload file
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const feedRouter = require('./routes/feed');
const authRouter = require('./routes/auth');

const app = express();

app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));
// Init folders if not created
const fileUtil = require('./util/file');
fileUtil.initFolders();
// Lift CORS restriction
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRouter);
app.use('/auth', authRouter);
// error handling
app.use((error, req, res, next) => {
    console.log('Error got: %o', error);
    const status = error.statusCode;
    const message = error.message;
    res.status(status).json({
        message: message,
        data: error.data
    });
});
mongoose.connect('mongodb://localhost:27017/restapi')
    .then(connectionOk => {
        const server = app.listen(8080);
        // setup websocket
        io.init(server);
        io.getIO().on('connection', socket => {
            console.log('Client connected');
        })
    })
    .catch(err => {
        console.log('Unable to start server, DB connection error: %o', err);
    })