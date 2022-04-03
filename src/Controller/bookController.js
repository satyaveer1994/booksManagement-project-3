
const moment = require("moment")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bookModel = require("../models/bookModel")
const reviewModel =require("../models/reviewsModel")
 const userModel = require("../models/userModel")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


        //...............................create book............................................


let createBook = async (req, res) => {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'please provide book details' })
        }

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestBody
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: 'book title is required' })
            return
        }
        if (!isValid(excerpt)) {
            res.status(400).send({ status: false, message: 'excerpt is required' })
            return
        }
        if (!isValid(userId)) {
            res.status(400).send({ status: false, message: 'user id is required' })
            return
        }
        if (!isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid user id ` })
            return
        }
        if (!isValid(ISBN)) {
            res.status(400).send({ status: false, message: 'ISBN is required' })
            return
        }
        if (!isValid(category)) {
            res.status(400).send({ status: false, message: 'category is required' })
            return
        }
        if (!isValid(subcategory)) {
            res.status(400).send({ status: false, message: 'subcategory is required' })
            return
        }

        if (!isValid(releasedAt)) {
            res.status(400).send({ status: false, message: 'released date is required' })
            return
        }
        let user = await userModel.findById(userId)
        if (!user) {
            res.status(404).send({ status: false, message: "user not found" })
        }

        let titleUsed = await bookModel.findOne({ title })
        if (titleUsed) {
            return res.status(400).send({ status: false, message: "title already used" })
        }


        //...................................validation...............................................


        let validateISBN = function (ISBN) {
            return /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN);
        }
        if (!validateISBN(ISBN)) {
            return res.status(400).send({ status: false, message: "Please enter a valid ISBN" })
        }

        let validateReleasedAt = function (releasedAt) {
            return /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(releasedAt);
        }
        if (!validateReleasedAt(releasedAt)) {
            return res.status(400).send({ status: false, message: "Invalid format, please enter date in YYYY-MM-DD format" })
        }


        //....................................duplicate data.......................................


        const isbnAlreadyUsed = await bookModel.findOne({ ISBN })

        if (isbnAlreadyUsed) return res.status(400).send({ status: false, message: "ISBN already registered" })


        const newBook = await bookModel.create(requestBody)
        res.status(201).send({ status: true, message: "Success", data: newBook })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


      //........................................get books..........................................


const getBook = async (req, res) => {
    try {
        const data = req.query
        const filter = {
            isDeleted: false,
            ...data
        }
        const books = await bookModel.find(filter).select({ "title": 1, "excerpt": 1, "userId": 1, "category": 1, "reviews": 1, "releasedAt": 1 })
        if (books.length === 0) {
            return res.status(404).send({ status: true, message: "no book found" })
        }
        function compare(a, b) {
            if (a.title < b.title) {
                return -1;
            }
            if (a.title > b.title) {
                return 1;
            }
            return 0;
        }

        books.sort(compare)
        return res.status(200).send({ status: true, message: "Books list", data: books })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


        //...............................get books by Id.............................................


const getBooksById = async (req, res) => {

    try {
        const id = req.params.bookId

        if (!isValidObjectId(id)) {
            res.status(400).send({ status: false, message: `${id} is not a valid book id ` })
            return
        }

        const isPresent = await bookModel.findById({ _id: id })

        if (!isPresent) return res.status(404).send({ status: false, message: "Book not found" })

        const book = await bookModel.findOne({ _id: id, isDeleted: false }).select({ isDeleted: 0 })

        if (!book) return res.status(400).send({ status: false, message: "Book is deleted" })

        const reviews = await reviewModel.find({ bookId: id, isDeleted: false }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

        const newBook = JSON.parse(JSON.stringify(book))
        newBook.reviewsData = [...reviews]

        return res.status(200).send({ status: true, message: "Success", data: newBook })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
    
 
    //.....................................update book.........................................
  

const updateBook = async (req, res) => {

    try {
        let data = req.body
        const id = req.params.bookId

        const { title, ISBN } = data

        if (!isValidObjectId(id)) {
            res.status(400).send({ status: false, message: `${id} is not a valid book id ` })
            return
        }

        if (!Object.keys(data).length > 0) return res.send({ status: false, message: "Please enter data for updation" })

        const bookPresent = await bookModel.findById({ _id: id })

        if (!bookPresent) return res.status(404).send({ status: false, message: "Book not found" })

        let titleUsed = await bookModel.findOne({ title })
        if (titleUsed) {
            return res.status(400).send({ status: false, message: "title must be Unique" })
        }
        let IsbnUsed = await bookModel.findOne({ ISBN })
        if (IsbnUsed) {
            return res.status(400).send({ status: false, message: "isbn must be unique" })
        }

        if (data.isDeleted == true) {
            data.deletedAt = moment().format("YYYY-MM-DD")
        }

        const update = await bookModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: data }, { new: true })

        if (!update) return res.status(400).send({ status: false, message: "Book is Deleted" })

        return res.status(200).send({ status: true, message: "Success", data: update })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


        //.....................................update book.............................................


const deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params
        if (!isValidObjectId(bookId)) {
            res.status(400).send({ status: false, message: `${bookId} is not a valid book id ` })
            return
        }
        const book = await bookModel.findById(bookId)
        if (!book) {
            return res.status(404).send({ status: false, message: "Book not found" })
        }
        if (book.isDeleted == true) {
            return res.status(400).send({ status: false, message: "Book is already deleted" })
        }
        const delBook = await bookModel.findByIdAndUpdate(bookId, { isDeleted: true, deletedAt: moment().format("YYYY-MM-DD") }, { new: true })
        return res.status(200).send({ status: true, message: "success", data: delBook })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createBook, getBook, getBooksById, updateBook, deleteBook }