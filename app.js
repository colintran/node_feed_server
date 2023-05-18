const express = require('express');
const bodyParser = require('body-parser');

const feedRouter = require('./routes/feed');

const app = express();
app.use(bodyParser.json());

app.use(feedRouter);

app.listen(8080);