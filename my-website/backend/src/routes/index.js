import express from 'express';
const router = express.Router();

// Define a sample route
router.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Additional routes can be defined here

export default router;