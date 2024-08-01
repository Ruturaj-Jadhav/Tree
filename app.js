const express = require('express');
const mongoose = require('mongoose');
const cardRoutes = require('./routes/cardRoutes'); // Adjust the path as necessary
const userRoutes = require('./routes/userRoutes'); // Adjust the path as necessary
const frontendRoutes = require('./routes/frontendRoutes'); 
const authRoutes = require('./routes/authRoutes'); // Adjust the path as necessary
const dotenv = require('dotenv').config();
const app = express();

const ejs = require('ejs');
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/assets', express.static(path.join(__dirname, 'views', 'assets')));
app.use('/forms', express.static(path.join(__dirname, 'views', 'forms')));

app.get("/login" , (req,res) =>{
    console.log("Hello")
    res.render('pages-login',{});
})

mongoose.connect('mongodb://localhost:27017/Tree-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

app.use('/api/card', cardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/frontend',frontendRoutes); 
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
