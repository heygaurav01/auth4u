// app.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret'; // Change this to a secure secret

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Add this line to serve static files

// Connect to MongoDB (replace 'your_mongo_uri' with your actual MongoDB URI)
mongoose.connect('mongodb+srv://yatantemp:aNNgPZbSqeWjNUIF@testdb.4cpzf.mongodb.net/?retryWrites=true&w=majority&appName=testdb')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// User model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, default: null },
    password: { type: String, required: true }
});

// Drop existing indexes before creating new ones
mongoose.connect('mongodb+srv://yatantemp:aNNgPZbSqeWjNUIF@testdb.4cpzf.mongodb.net/?retryWrites=true&w=majority&appName=testdb')
    .then(async () => {
        try {
            await mongoose.connection.collection('users').dropIndexes();
            console.log('Indexes dropped successfully');
        } catch (err) {
            console.log('No indexes to drop');
        }
    });

const User = mongoose.model('User', UserSchema);

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ 
            username, 
            password: hashedPassword 
        });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send('Error creating user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token });
});

// Add this route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
