const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel");

//................................authentication.....................................................

const authentication = async (req, res, next) => {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res
        .status(401)
        .send({ status: false, message: "important header missing" });
    }
    let decodedToken = jwt.verify(token, "projectthreebook");
    if (!decodedToken)
      return res
        .status(401)
        .send({ status: false, message: "token is not valid" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
  next();
};

//................................authorisation.....................................................

const authorisation = async (req, res, next) => {
  try {
    let token = req.headers["x-api-key"];
    let decodedToken = jwt.verify(token, "projectthreebook");
    let userLoggingIn = req.params.bookId;
    let userLoggedIn = decodedToken.id;
    let value = await bookModel.findById(userLoggingIn);
    if (!value)
      return res.status(404).send({ status: false, message: "book not found" });
    if (value.userId != userLoggedIn)
      return res
        .status(403)
        .send({
          status: false,
          message: "You are not allowed to modify requested book data",
        });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
  next();
};

module.exports = { authentication, authorisation };
