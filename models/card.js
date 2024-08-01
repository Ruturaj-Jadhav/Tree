const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  parentCard: { type: Schema.Types.ObjectId, ref: 'Card' },
  childrenCard: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
  editors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, default: false },
  readers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  title: { type: String, required: true },
  document: { type: Schema.Types.ObjectId, ref: 'Document' },
  isComplete: { type: Boolean, default: false },
  dueDate: { type: Date },
  startDate: { type: Date },
  taskAssignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
