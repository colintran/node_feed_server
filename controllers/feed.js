const feedList = [];
exports.getFeeds = (req,res,next) => {
    return res.status(200).json(JSON.stringify(feedList));
}

exports.postFeed = (req,res,next) => {
    let message = req.body.message;
    let author = req.body.author;
    let newFeed = {
        message: message,
        author: author
    };
    feedList.push(newFeed)
    return res.status(201).json(newFeed);
}