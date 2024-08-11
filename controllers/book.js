const Book = require('../models/book');
const fs = require('fs');

// Create and Save new book
exports.createBook = async (req, res) => {
    try {
        const bookObject = JSON.parse(req.body.book);
        const book = new Book({
            ...bookObject,
            imageUrl: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : ""
        });

        await book.save();
        res.status(201).json({ message: 'Livre sauvegardé' });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Create Rating
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
            book.averageRating = newRating / book.ratings.length;

            await book.save();
            res.status(201).json(book);
        } else {
            res.status(409).json({ message: 'Book already rated' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read
exports.getAllBook = (req, res, next) => {
    Book.find()
      .then((books) => res.status(200).json(books))
      .catch((error) => res.status(400).json({ error }));
  };

// Read one book
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then((book) => res.status(200).json(book))
      .catch((error) => res.status(404).json({ error }));
  };

// Update
exports.updateOneBook = async (req, res, next) => {
    try {
      const bookObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
          }
        : { ...req.body };
  
      delete bookObject._userId;
  
      const book = await Book.findOne({ _id: req.params.id });
      if (book.userId !== req.auth.userId) {
        return res.status(401).json({ message: "Vous n'avez pas l'autorisation" });
      }
  
      if (req.file) {
        const oldFilename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${oldFilename}`, (err) => {
          if (err) console.error("Erreur lors de la suppression de l'image:", err);
        });
      }
  
      await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
      res.status(200).json({ message: "Livre modifié !" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Delete
exports.deleteOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (book.userId !== req.auth.userId) {
          return res.status(401).json({ message: "Vous n'avez pas l'autorisation" });
        }
  
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) console.error("Erreur lors de la suppression de l'image:", err);
        });
  
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre supprimé !" }))
          .catch((error) => res.status(401).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  };

// Best rating
exports.bestRating = async (_req, res) => {
    try {
        const books = await Book.find({}).sort({ averageRating: 'desc' }).limit(3);
        res.json(books);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error });
    }
};

