import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { username, email } = req.body;
    const newUser = new User({ username, email });
    newUser.save()
      .then(user => res.status(201).json(user))
      .catch(err => res.status(400).json({ error: err.message }));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
   const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
