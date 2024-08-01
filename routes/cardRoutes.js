const express = require('express');
const router = express.Router();
const Card = require('../models/card'); // Adjust the path as necessary


const {
  addReaderRecursive,
  removeReaderRecursive,
  addEditorRecursive,
  removeEditorRecursive
} = require('../helpers/accessControl');

// Middleware to check if user is in readers or editors list
const checkAccess = (req, res, next) => {
  const userId = req.params.userId;
  Card.findById(req.params.cardId)
    .then(card => {
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
      const isEditor = card.editors.includes(userId);
      const isReader = card.readers.includes(userId);

      if (!isEditor && !isReader) {
        return res.status(403).json({ message: 'Access denied' });
      }

      req.isEditor = isEditor;
      req.isReader = isReader;
      next();
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

// Add a reader to a card and its children
router.post('/:userId/:cardId/addReader/:targetUserId', checkAccess, async (req, res) => {
  if (!req.isEditor) {
    return res.status(403).json({ message: 'Editor access required' });
  }

  try {
    await addReaderRecursive(req.params.cardId, req.params.targetUserId);
    res.status(200).json({ message: 'Reader access added recursively' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a reader from a card and its children
router.post('/:userId/:cardId/removeReader/:targetUserId', checkAccess, async (req, res) => {
  if (!req.isEditor) {
    return res.status(403).json({ message: 'Editor access required' });
  }

  try {
    await removeReaderRecursive(req.params.cardId, req.params.targetUserId);
    res.status(200).json({ message: 'Reader access removed recursively' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add an editor to a card and its children
router.post('/:userId/:cardId/addEditor/:targetUserId', checkAccess, async (req, res) => {
  if (!req.isEditor) {
    return res.status(403).json({ message: 'Editor access required' });
  }

  try {
    await addEditorRecursive(req.params.cardId, req.params.targetUserId);
    res.status(200).json({ message: 'Editor access added recursively' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove an editor from a card and its children
router.post('/:userId/:cardId/removeEditor/:targetUserId', checkAccess, async (req, res) => {
  if (!req.isEditor) {
    return res.status(403).json({ message: 'Editor access required' });
  }

  try {
    await removeEditorRecursive(req.params.cardId, req.params.targetUserId);
    res.status(200).json({ message: 'Editor access removed recursively' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new card with a parent card
router.post('/:userId/:cardId/create', async (req, res) => {
  const { userId, cardId } = req.params;

  // Ensure userId is added to editors and readers if not already present
  if (!req.body.editors) {
    req.body.editors = [userId];
  } else if (!req.body.editors.includes(userId)) {
    req.body.editors.push(userId);
  }
  
  if (!req.body.readers) {
    req.body.readers = [userId];
  } else if (!req.body.readers.includes(userId)) {
    req.body.readers.push(userId);
  }

  // Set parentCard field to cardId
  req.body.parentCard = cardId;

  try {
    // Create new card instance
    const card = new Card(req.body);
    
    // Save the card
    const savedCard = await card.save();

    // Push the newly created card's ID into cardId's childrenCard array
    const parentCard = await Card.findByIdAndUpdate(cardId, { $push: { childrenCard: savedCard._id } }, { new: true });

    res.status(201).json(savedCard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Create a new home card
router.post('/:userId/createHome', async (req, res) => {
  const userId = req.params.userId;
  console.log('Creating home card for user:', userId);

  req.body.editors = [userId];
  req.body.readers = [userId];
  req.body.parentCard = null;
  req.body.title = 'Home';

  const card = new Card(req.body);

  try {
    const savedCard = await card.save();
    console.log('Home card created:', savedCard);
    
    res.status(201).json(savedCard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/:userId/home', async (req, res) => {
  console.log("Entering /:userId/home route with userId:", req.params.userId);
});

// Get a card by ID
router.get('/:userId/:cardId', checkAccess, async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (card == null) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a card
router.put('/:userId/:cardId', checkAccess, async (req, res) => {
  if (!req.isEditor) {
    return res.status(403).json({ message: 'Editor access required' });
  }

  try {
    const card = await Card.findByIdAndUpdate(req.params.cardId, req.body, { new: true });
    if (card == null) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.json(card);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a card
router.delete('/:userId/:cardId', checkAccess, async (req, res) => {
  if (!req.isEditor) {
    return res.status(403).json({ message: 'Editor access required' });
  }

  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (card == null) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
