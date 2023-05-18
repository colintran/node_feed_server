const feedList = [];
exports.getFeeds = (req,res,next) => {
    console.log('One request come from: %o',req.headers);
    return res.status(200).json(feedList);
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