const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
    {timestamps: true} // Like _id, this hidden parameter is automatically added into mongodb everytime new record is created
);

module.exports = mongoose.model('Post', postSchema);