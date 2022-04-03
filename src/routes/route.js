const express = require("express");
const router = express.Router();
const userController =require("../Controller/userController")
const bookController =require("../Controller/bookController")
const  reviewsController=require("../Controller/reviewsController")
const middelwears=require("../middelwears/auth")

// user
router.post("/register", userController.register)

router.post("/login", userController.login)

// book
router.post('/books',middelwears.authentication,bookController.createBook)

router.get("/books",middelwears.authentication, bookController.getBook)

router.get("/books/:bookId",middelwears.authentication, bookController.getBooksById)

router.put("/books/:bookId",middelwears.authentication, middelwears.authorisation,bookController.updateBook)

router.delete("/books/:bookId",middelwears.authentication, middelwears.authorisation, bookController.deleteBook)

// review
router.post("/books/:bookId/review", reviewsController.createReview)

router.put("/books/:bookId/review/:reviewId",reviewsController.updateReview)

router.delete("/books/:bookId/review/:reviewId",reviewsController.deleteReview)




module.exports = router;


