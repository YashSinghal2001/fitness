const express = require('express');
const { uploadPhotos, getPhotos, getComparePhotos } = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', upload.fields([{ name: 'front' }, { name: 'side' }, { name: 'rear' }]), uploadPhotos);
router.get('/compare', getComparePhotos);
router.get('/:clientId', getPhotos);

module.exports = router;
