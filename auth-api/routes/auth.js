const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password) => /^(?=.*[0-9]).{8,}$/.test(password);

router.post("/register", async (req, res) => {
  const { fullName, email, password, passwordConfirmation } = req.body;

  const errors = {};

  if (!isValidEmail(email)) {
    errors.email = "Invalid email format.";
  }
  if (!isValidPassword(password)) {
    errors.password =
      "Password must be at least 8 characters long and contain a number.";
  }
  if (password !== passwordConfirmation) {
    errors.passwordConfirmation = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: "Validation Failed",
      details: errors,
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName: fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      message: "User registered successfully.",
      token: token,
    });
  } catch (err) {
    return res.send(500).json({
      error: "An internal server error occurred. Please try again later/",
    });
  }
});

module.exports = router;
