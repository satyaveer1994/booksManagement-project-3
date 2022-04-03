const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["Mr", "Mrs", "Miss"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      requried: true,
      unique: true,
    },
    email: {
      type: String,
      requried: true,
      Unique: true,
    },
    password: {
      type: String,
      requried: true,
      Unique: true,
    },
    address: {
      street: { type: String },
      city: { type: String },
      pincode: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
