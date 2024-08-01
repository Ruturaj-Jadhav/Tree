
// GET endpoint to retrieve card information in specified format
const express = require('express');
const router = express.Router();
const Card = require('../models/card'); // Adjust the path as necessary
const User = require('../models/user'); // Adjust the path as necessary
const mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId
const path = require('path');
const localStorage = require('local-storage');
const axios = require('axios');
const jwt = require('jsonwebtoken')

require('dotenv').config();

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
}

const JWT_SECRET = process.env.JWT_SECRET;

router.use('/assets', express.static(path.join(__dirname, '..', 'views', 'assets')));
router.use('/forms', express.static(path.join(__dirname, '..', 'views', 'forms')));


// Debugging middleware
router.use((req, res, next) => {
  console.log(`Frontend Route Request: ${req.method} ${req.url}`);
  next();
});


// GET endpoint to retrieve card hierarchy under a parent card for a user
router.get('/:userId/:parentCardId', async (req, res) => {
  try {
    const { userId, parentCardId } = req.params;

    console.log("Entering /:userId/:parentCardId route with userId:", userId, "and parentCardId:", parentCardId);

    // Find user to validate and get necessary information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Query cards based on parentCardId and populate necessary fields
    const parentCard = await Card.findById(parentCardId);
    if (!parentCard) {
      return res.status(404).json({ message: 'Parent card not found' });
    }

    // Initialize result object with parent card details
    const result = {
      parentCardID: parentCard._id,
      parentCardTitle: parentCard.title,
      parentCardIsComplete: parentCard.isComplete, // Include isComplete field
      ChildCardArray: []
    };

    // Iterate through children cards and populate grandchildren details
    for (const childCardId of parentCard.childrenCard) {
      const childCard = await Card.findById(childCardId);
      if (childCard) {
        const grandchildren = [];
        for (const grandchildId of childCard.childrenCard) {
          const grandchildCard = await Card.findById(grandchildId);
          if (grandchildCard) {
            grandchildren.push({
              grandchildID: grandchildCard._id,
              grandchildTitle: grandchildCard.title,
              grandchildIsComplete: grandchildCard.isComplete // Include isComplete field
            });
          }
        }
        result.ChildCardArray.push({
          childCardID: childCard._id,
          childCardTitle: childCard.title,
          childCardIsComplete: childCard.isComplete, // Include isComplete field
          grandchildren
        });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Display Home
router.post('/home/:userId', async (req, res) => {
  try {
    console.log("Entering /:userId/home route with userId:", req.params.userId);
    const userId = req.params.userId;

    // Validate and convert userId to ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const userObjectId = new ObjectId(userId);

    // Find user to validate and get necessary information
    const user = await User.findById(userObjectId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Query home card based on user ID
    const homeCard = await Card.findOne({ title: 'Home', editors: userObjectId });
    if (!homeCard) {
      return res.status(404).json({ message: 'Home card not found' });
    }

    // Initialize result object with home card details
    const result = {
      parent: {
        parentCardID: homeCard._id,
        parentCardTitle: homeCard.title,
        parentCardIsComplete: homeCard.isComplete, // Include isComplete field
        ChildCardArray: []
      }
    };

    // Iterate through children cards and populate grandchildren details
    for (const childCardId of homeCard.childrenCard) {
      const childCard = await Card.findById(childCardId);
      if (childCard) {
        const grandchildren = [];
        for (const grandchildId of childCard.childrenCard) {
          const grandchildCard = await Card.findById(grandchildId);
          if (grandchildCard) {
            grandchildren.push({
              grandchildID: grandchildCard._id,
              grandchildTitle: grandchildCard.title,
              grandchildIsComplete: grandchildCard.isComplete // Include isComplete field
            });
          }
        }
        result.parent.ChildCardArray.push({
          childCardID: childCard._id,
          childCardTitle: childCard.title,
          childCardIsComplete: childCard.isComplete, // Include isComplete field
          grandchildren
        });
      }
    }
   
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/get-card' , async (req,res) => {
  const {grandchildId} = req.body;
  console.log(grandchildId);
})

// Route to handle POST request for submitting tasks
router.post('/submitTask', async (req, res) => {
  try {
    // Forward request to create new card
     // Assuming userId is stored in localStorage as token
     const { task, childCardId } = req.body;
     const parentCardId = childCardId;
     const cardTitle = task;
     const token = localStorage.get('token')
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     const userId = decoded.id;

    const response = await axios.post(`http://localhost:3000/api/card/${userId}/${parentCardId}/create`, {
      title: cardTitle,
      // Add any other fields needed for card creation here
    });

    console.log('New card created:', response.data);
    res.status(200).send('Card submitted successfully');
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});




// Route to handle POST request for submitting cards
router.post('/submitCard', async (req, res) => {
  const { cardTitle, parentCardId } = req.body;
  console.log('Received card title:', cardTitle);
  console.log('Associated parent card ID:', parentCardId);

  try {
    // Forward request to create new card
     // Assuming userId is stored in localStorage as token
     const token = localStorage.get('token')
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     const userId = decoded.id;

    const response = await axios.post(`http://localhost:3000/api/card/${userId}/${parentCardId}/create`, {
      title: cardTitle,
      // Add any other fields needed for card creation here
    });

    console.log('New card created:', response.data);
    res.status(200).send('Card submitted successfully');
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});




module.exports = router;
