const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage - files saved in /uploads folder preserving original filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|mov|avi|mkv/;
  const allowedDocumentTypes = /pdf|doc|docx|txt|ppt|pptx/;
  
  const extName = path.extname(file.originalname).toLowerCase().substring(1);
  const mimeType = file.mimetype;

  // Check if file type is allowed
  const isImage = allowedImageTypes.test(extName) && mimeType.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extName) && mimeType.startsWith('video/');
  const isDocument = allowedDocumentTypes.test(extName) && (
    mimeType === 'application/pdf' ||
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'text/plain' ||
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  );

  if (isImage || isVideo || isDocument) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${extName}. Allowed types: images (jpg, png, gif, webp), videos (mp4, webm, mov, avi, mkv), documents (pdf, doc, docx, txt, ppt, pptx)`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 500 * 1024 * 1024 // 500 MB limit for videos
  }
});

module.exports = upload;
