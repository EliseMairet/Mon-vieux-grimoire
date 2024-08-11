const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { upload, convertToWebp } = require("../middleware/multer");
const bookCtrl = require('../controllers/book.js');

router.get('/bestrating', bookCtrl.bestRating);
router.post('/', auth, upload, convertToWebp, bookCtrl.createBook);
router.put('/:id', auth, upload, convertToWebp, bookCtrl.updateOneBook);
router.delete('/:id', auth, bookCtrl.deleteOneBook);
router.post("/:id/rating", auth, bookCtrl.createRatingBook);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBook);
module.exports = router;
