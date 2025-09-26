//const multer = require('multer');
//const storage = multer.memoryStorage();
//const fileFilter = (req, file, cb) => {
  //if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    //cb(null, true);
  //} else {
    //cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
  //}
//};
//const upload = multer({ storage, fileFilter });
//module.exports = upload;


// middleware/multerImageUpload.js


// middleware/multerImageUpload.js

// middleware/multerImageUpload.js

const multer = require('multer');
const storage = multer.memoryStorage();

// This function checks the file type.
const fileFilter = (req, file, cb) => {
  // 'image/jpeg' correctly handles both .jpg and .jpeg files.
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true); // Accept the file
  } else {
    // This is the error message for invalid types.
    cb(new Error('Invalid file type. Only PNG and JPG/JPEG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// This middleware should ONLY be used on specific routes that need direct server uploads.
// It should NOT be used globally.
module.exports = upload;