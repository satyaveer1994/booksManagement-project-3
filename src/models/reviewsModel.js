
const mongoose = require("mongoose")




const reviewSchema = mongoose.Schema({
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    reviewedBy:{
        type: String,
        default:"Guest"
    },
    reviewedAt:{
        type: String,
        required: true,
    },
    rating:{
        type:Number,
        required: true
    },
    review: String,
    isDeleted:{
        type: Boolean,
        default: false
    }

},{timestamps: true})

module.exports = mongoose.model("Review", reviewSchema)




