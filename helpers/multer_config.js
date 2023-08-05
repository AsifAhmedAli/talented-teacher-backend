const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Specify the folder where the file will be stored temporarily
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original name of the file
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG and PNG files are allowed."),
      false
    );
  }
};

const limits = {
  fileSize: 1000000, // Limit file size to 1MB
};

const upload = multer({
  storage: storage,
  limits: limits,
  fileFilter: fileFilter,
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error occurred
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size limit exceeded. Maximum file size allowed is 1MB.",
      });
    }
    return res
      .status(500)
      .json({ error: "An error occurred during file upload." });
  } else if (err) {
    // Other error occurred
    // console.log(err.message);
    return res.status(400).json({ error: err.message });
  }
  next();
};

// multer for a attachments for Email send to all voters


const attachment_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Create Multer upload instance
const attachment_upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'audio/mpeg' ||
      file.mimetype === 'video/mp4' ||
      file.mimetype === 'audio/mpeg3' ||
      file.mimetype === 'audio/x-mpeg-3' ||
      file.mimetype === 'audio/mp3' ||
      file.mimetype === 'audio/wav' ||
      file.mimetype === 'application/octet-stream' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  
    )
    
    {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format.'));
    }
  },
});


// Configuration for file upload using Multer
const chat_storage = multer.memoryStorage();

// Define the allowed file extensions
const allowedFileExtensions = [
  'txt', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'png', 'jpeg', 'jpg', 'mp3', 'wav', 'mp4', 'mpeg', 'mpga'
];

const chat_fileFilter = (req, file, cb) => {
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  if (allowedFileExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format.'));
  }
};

const chat_upload = multer({
  storage: chat_storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit the file size to 10 MB (in bytes)
  },
  fileFilter: chat_fileFilter,
});


module.exports = { upload, handleUploadError,attachment_upload,chat_upload };
