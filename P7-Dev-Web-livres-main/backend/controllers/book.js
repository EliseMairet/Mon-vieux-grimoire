const Book = require('../models/book');
const fs = require('fs');

function deleteImgFile (bookToDelete) {
    if (bookToDelete.imageUrl) {
        const filenameThumb = bookToDelete.imageUrl.split('/images/')[1];
        const filenameLarge = filenameThumb.split('_thumbnail')[0];

        fs.unlink(`images/${filenameLarge}.jpg`, () => { });
        fs.unlink(`images/${filenameLarge}.jpeg`, () => { });
        fs.unlink(`images/${filenameLarge}.png`, () => { });
        fs.unlink(`images/${filenameThumb}`, () => { });
    }
};

//Create and Save new book
exports.createBook = async(req, res) => {
    try {
        const bookObject = JSON.parse(req.body.book);
        const book = new Book ({
            ...bookObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.replace(/\.jpeg|\.jpg|\.png/g, "_")}thumbnail.webp`
        });

        await book.save();

        res.status(201).json({ message: 'Livre sauvegardé' });
    } catch (error) { 
        res.status(500).json({ error });
    };
};

//Create Rating 
exports.createRatingBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            res.status(404).json({ message: 'Livre introuvable' });
        }
    
        const isAlreadyRated = book.ratings.find(rating => rating.userId === req.auth.userId);
        if (!isAlreadyRated) {
            book.ratings.push({
                userId: req.auth.userId,
                grade: req.body.rating
            });

            let newRating = 0;
            book.ratings.forEach(rating => {
                newRating = newRating + rating.grade;
            });
            book.averageRating = newRating/book.ratings.length;
            // book.averageRating = book.ratings.reduce((accumulator, currentValue) => accumulator + currentValue.grade, 0) / book.ratings.length;
        
            await book.save();
            res.status(201).json(book);
        } else {
            res.status(409).json({ message: 'Book already rated' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Read
exports.getAllBook = async(_req, res) => {
    const books = await Book.find({});
    res.json(books);
};

exports.getOneBook = async(req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        res.json(book);
    } catch (error) {
        res.status(404).json({ error });
    }
};

//Update
exports.updateOneBook = async(req, res) => {
    const book = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.replace(/\.jpeg|\.jpg|\.png/g, "_")}thumbnail.webp`,
    } : req.body;

    const bookBefore = await Book.findOneAndUpdate({ _id: req.params.id, userId: req.auth.userId }, book);
    if (!bookBefore) {
        res.status(403).json({ message : 'Non autorisé'});
    }

    deleteImgFile(bookBefore);

    res.json({ message: 'Livre mis a jour' });
};

//Delete
exports.deleteOneBook = async(req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, userId: req.auth.userId });
        if (!book) {
            res.status(403).json({ message: 'Non autorisé' });
        }
        
        deleteImgFile(book);

        await book.deleteOne({ _id: req.params.id });
        res.json({ message: 'Livre supprimé' });
    } catch(error) {
        res.status(500).json({ error });
    }
};

// Best rating
exports.bestRating = async(_req, res) => {
    try {
        const books = await Book.find({}).sort({ averageRating: 'desc' }).limit(3);
        res.json(books);
    } catch(error) {
        console.error(error.message);
        res.status(500).json({ error });
    }
};