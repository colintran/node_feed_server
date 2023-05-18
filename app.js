const express = require('express');
const bodyParser = require('body-parser');

const feedRouter = require('./routes/feed');

const app = express();
app.use(bodyParser.json());
// Lift CORS restriction
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(feedRouter);


app.listen(8080);