

const multer = require('multer'); 


const uplaod = multer({  
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 } 


}) 


module.exports = uplaod;