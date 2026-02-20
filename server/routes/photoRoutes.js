const express = require('express');
const {
  uploadPhotos,
  getPhotos,
  getComparePhotos,
} = require('../controllers/photoController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/compare', getComparePhotos);

router.route('/')
  .post(upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'side', maxCount: 1 },
    { name: 'rear', maxCount: 1 }
  ]), uploadPhotos);

router.route('/:clientId')
  .get(getPhotos);

// Also support GET /api/photos for current user (optional, but good practice)
router.route('/')
  .get(getPhotos);

module.exports = router;
