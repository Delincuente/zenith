require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const db = require('./models');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Routes
const authRoutes = require('./routes/authRoutes');

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'SaaS Project Management API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

