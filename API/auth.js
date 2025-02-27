const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require(__dirname + '/models/User');
const { verifyToken } = require(__dirname + '/middleware/authMiddleware');
const { connectDB } = require(__dirname + '/db');
const axios = require('axios'); // Add axios for HTTP requests

module.exports = async (req, res) => {
  try {
    await connectDB(); // Connect to database

    // Handle /analyze (POST)
    if (req.url === '/analyze' && req.method === 'POST') {
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

          const response = await axios.post('/api/submit-assessment', {
            answers,
            studentInfo: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              school: user.schoolName,
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

    // Handle /signup (POST)
    if (req.url === '/signup' && req.method === 'POST') {
      const { body } = req;
      const academicInfo = `${body.standard}th Grade - ${body.academicPerformance || 'Not specified'}`;

      const user = new User({
        ...body,
        password: body.password,
        academicInfo: academicInfo,
        studentName: `${body.firstName} ${body.lastName}`
      });

      await user.save();

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
      return;
    }

    // Handle /login (POST)
    if (req.url === '/login' && req.method === 'POST') {
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

    // Handle /profile (GET)
    if (req.url === '/profile' && req.method === 'GET') {
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