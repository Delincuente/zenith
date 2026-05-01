const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const clientRoutes = require('./clientRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const userRoutes = require('./userRoutes');
const billingRoutes = require('./billingRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

// Mount routes
router.use('/auth', authRoutes);

// Protect all following routes
router.use(authMiddleware);

router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/billing', billingRoutes);

module.exports = router;
