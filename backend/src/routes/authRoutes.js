const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser
} = require("../services/authService");

router.post("/register", (req, res, next) => {
  try {
    const user = registerUser(req.body);

    res.status(201).json({
      message: "Registration successful",
      user
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  try {
    const result = loginUser(req.body);

    res.status(200).json({
      message: "Login successful",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;