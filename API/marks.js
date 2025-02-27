// api/marks.js
const { verifyToken } = require('../middleware/authMiddleware'); // Adjust path
const Marks = require('../models/Marks'); // Adjust path
const { connectDB } = require('../db'); // Adjust path

module.exports = async (req, res) => {
  try {
    await connectDB(); // Connect to database

    if (req.url === '/marks' && req.method === 'POST') {
      verifyToken(req, res, () => {
        if (!req.user?.userId) {
          return res.status(401).json({ error: 'User not authenticated' });
        }

        const { subjects } = req.body;

        const marksEntry = new Marks({
          userId: req.user.userId,
          subjects: subjects
        });

        marksEntry.save()
          .then(() => {
            res.status(201).json({ message: 'Marks saved successfully' });
          })
          .catch(error => {
            console.error('Error saving marks:', error);
            res.status(500).json({ error: 'Failed to save marks' });
          });
      });
      return;
    }

    res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('Marks route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};