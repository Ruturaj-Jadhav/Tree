const Card = require('../models/card');

const addReaderRecursive = async (cardId, userId) => {3
  const card = await Card.findById(cardId);
  if (!card) return;

  if (!card.readers.includes(userId)) {
    card.readers.push(userId);
    await card.save();
  }

  for (const childId of card.childrenCard) {
    await addReaderRecursive(childId, userId);
  }
};

const removeReaderRecursive = async (cardId, userId) => {
  const card = await Card.findById(cardId);
  if (!card) return;

  card.readers = card.readers.filter(id => id.toString() !== userId);
  await card.save();

  for (const childId of card.childrenCard) {
    await removeReaderRecursive(childId, userId);
  }
};

const addEditorRecursive = async (cardId, userId) => {
  const card = await Card.findById(cardId);
  if (!card) return;

  if (!card.editors.includes(userId)) {
    card.editors.push(userId);
    await card.save();
  }

  for (const childId of card.childrenCard) {
    await addEditorRecursive(childId, userId);
  }
};

const removeEditorRecursive = async (cardId, userId) => {
  const card = await Card.findById(cardId);
  if (!card) return;

  card.editors = card.editors.filter(id => id.toString() !== userId);
  await card.save();

  for (const childId of card.childrenCard) {
    await removeEditorRecursive(childId, userId);
  }
};

module.exports = {
  addReaderRecursive,
  removeReaderRecursive,
  addEditorRecursive,
  removeEditorRecursive
};
