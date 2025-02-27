// E:\career-guide - Copy\API\auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/User.js');
const { verifyToken } = require('./middleware/authMiddleware.js');
const { connectDB } = require('./db.js');
const axios = require('axios');
const cors = require('cors'); // Ensure cors is installed

module.exports = async (req, res) => {
  // Enable CORS for localhost:3000
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    await connectDB(); // Connect to database

    // Handle /signup (POST) with full path
    if (req.url === '/API/auth/signup' && req.method === 'POST') { // Updated to match full path
      console.log('Signup request URL:', req.url);
      console.log('Signup request body:', req.body);
      const { body } = req;
      const academicInfo = `${body.standard}th Grade - ${body.academicPerformance || 'Not specified'}`;

      const user = new User({
        ...body,
        password: body.password,
        academicInfo: academicInfo,
        studentName: `${body.firstName} ${body.lastName}`
      });

      try {
        await user.save();
        console.log('User saved successfully:', user);
        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            age: user.age,
            interests: user.interests
          }
        });
      } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed', details: error.message });
      }
      return;
    }

    // Handle /analyze (POST) with full path
    if (req.url === '/API/auth/analyze' && req.method === 'POST') { // Updated to match full path
      verifyToken(req, res, async () => {
        if (!req.user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
          const user = await User.findById(req.user.userId);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          const answers = req.body.answers;

          const response = await axios.post('/API/submit-assessment', {
            answers,
            studentInfo: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              schoolName: user.schoolName,
              grade: user.standard,
              age: user.age,
              interests: user.interests
            }
          });

          res.json(response.data);
        } catch (error) {
          console.error('API call error:', error);
          res.status(500).json({ error: 'Failed to analyze career', details: error.message });
        }
      });
      return;
    }

    // Handle /login (POST) with full path
    if (req.url === '/API/auth/login' && req.method === 'POST') { // Updated to match full path
      const { email, password } = req.body;

      User.findOne({ email })
        .then(user => {
          if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
          }

          bcrypt.compare(password, user.password)
            .then(validPassword => {
              if (!validPassword) {
                return res.status(401).json({ message: 'Invalid email or password' });
              }

              const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
              );

              res.json({
                token,
                user: {
                  id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  age: user.age,
                  interests: user.interests
                }
              });
            })
            .catch(error => {
              res.status(500).json({ message: 'Password comparison error' });
            });
        })
        .catch(error => {
          res.status(500).json({ message: 'User not found' });
        });
      return;
    }

    // Handle /profile (GET) with full path
    if (req.url === '/API/auth/profile' && req.method === 'GET') { // Updated to match full path
      verifyToken(req, res, () => {
        if (!req.user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        User.findById(req.user.userId).select('-password')
          .then(user => {
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
          })
          .catch(error => {
            res.status(500).json({ message: 'Error fetching profile' });
          });
      });
      return;
    }

    res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('Auth route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};