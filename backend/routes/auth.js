const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const validate = require('../middleware/validate');
function authenticateToken(req, res, next)
{
  const authHeader = req.headers['authorization'];
  let token = authHeader;
  if (!token)
  {
    return res.status(401).json({ message: 'No token provided' });
  }
  if (token.startsWith('Bearer '))
  {
    token = token.slice(7).trim();
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) =>
  {
    if (err)
    {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
router.post('/register', validate('user'), async (req, res) => {
  try {
    const { email, name, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ email, name, password });
    console.log('About to save user:', user);

    await user.save();
    console.log('User saved:', user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generated:', token);

    return res.status(201).json({ token });
  } catch (error) {
    console.error('Unexpected error in register:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name, password: '' });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error with Google login:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(401).json({ message: 'Google auth failed' });
  }
});
router.get('/', authenticateToken, async (req, res) =>
{
  try
  {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  }
  catch (error)
  {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id', authenticateToken, async (req, res) =>
{
  try
  {
    const user = await User.findById(req.params.id).select('-password');
    if (!user)
    {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  }
  catch (error)
  {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:id', authenticateToken, async (req, res) =>
{
  try
  {
    const { email, name, password } = req.body;
    const updateData = {};
    if (email)
    {
      updateData.email = email;
    }
    if (name)
    {
      updateData.name = name;
    }
    if (password)
    {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user)
    {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  }
  catch (error)
  {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', authenticateToken, async (req, res) =>
{
  try
  {
    const user = await User.findByIdAndDelete(req.params.id).select('-password');
    if (!user)
    {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', user });
  }
  catch (error)
  {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
