
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name : { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    homeCardId: { type: Schema.Types.ObjectId, ref: 'Card' },
    cardsAccessible: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
    cardsReadable: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
    mostVisitedCards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
    recentlyVisitedCards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
    pinnedCards: [{ type: Schema.Types.ObjectId, ref: 'Card' }]
  });
  
const User = mongoose.model('User', userSchema);

module.exports = User;
