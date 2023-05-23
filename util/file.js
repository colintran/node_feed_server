const path = require('path');
const fs = require('fs');

exports.initFolders = () => {
    const foldersToInit = [path.join(__dirname, '..', 'images')];
    foldersToInit.forEach(dir => {
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
    });
}

exports.deleteFile = (fileName) => {
    fs.unlink(fileName, (err) => {
        console.log('Error in removing file [%s]: %s',fileName,err);
    });
}