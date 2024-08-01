const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Usermodel = require('../models/user.js');
const localStorage = require('local-storage');
const axios = require('axios');
const ejs = require('ejs');

const path = require('path');

router.use('/assets', express.static(path.join(__dirname, '..', 'views', 'assets')));
router.use('/forms', express.static(path.join(__dirname, '..', 'views', 'forms')));





// Load environment variables from .env file
require('dotenv').config();

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
}

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register',
 // Validate and sanitize input
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    const { name, email, username, password, terms } = req.body;

    try {
      const existingUser = await Usermodel.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ status: "error", error: "Username or email already in use" });
      }

      const hashPassword = await bcrypt.hash(password, 10);

     const user =  await Usermodel.create({
        username: username,
        password: hashPassword,
        email: email
      });
      const response = await axios.post(`http://localhost:3000/api/card/${user._id}/createHome`);
      res.redirect('http://localhost:5000/login')
      //res.status(201).render("login", { message: "User registered successfully" });
    } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ status: "error", error: "Internal Server Error" });
    }
});


router.post('/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await Usermodel.findOne({ username });
      if (!user) {
        return res.status(404).json({ status: "error", error: "User not found" });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ status: "error", error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
      localStorage.set('token', token);

      // Redirect to the home page
      const axiosResponse = await axios.post(`http://localhost:3000/api/frontend/home/${user._id}`);
      console.log(axiosResponse);

      // Render a view with the fetched data
      res.render('component-cards', { parent : axiosResponse.data.parent });


      
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ status: "error", error: "Internal Server Error" });
    }
});

const parent = {
  parentCardID: "60d21b4667d0d8992e610c85",
  parentCardTitle: "Parent Card Title",
  ChildCardArray: [
      {
          childCardID: "60d21b4667d0d8992e610c86",
          childCardTitle: "Child Card 1 Title",
          grandchildren: [
              {
                  grandchildID: "60d21b4667d0d8992e610c88",
                  grandchildTitle: "Grandchild 1 Title"
              },
              {
                  grandchildID: "60d21b4667d0d8992e610c89",
                  grandchildTitle: "Grandchild 2 Title"
              }
          ]
      },
      {
          childCardID: "60d21b4667d0d8992e610c87",
          childCardTitle: "Child Card 2 Title",
          grandchildren: [
              {
                  grandchildID: "60d21b4667d0d8992e610c90",
                  grandchildTitle: "Grandchild 3 Title"
              }
          ]
      }
  ]
};

// Route to render cards component with parent data
router.get('/card', (req, res) => {
  res.render('pages-login', {});
});

module.exports = router;
