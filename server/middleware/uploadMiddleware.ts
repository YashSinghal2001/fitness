import multer from 'multer';
import cloudinary from '../utils/cloudinary';

// Important: require full module
const MulterCloudinary = require('multer-storage-cloudinary');

// Access constructor correctly
const CloudinaryStorage = MulterCloudinary.CloudinaryStorage;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gym-progress',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

export default upload;