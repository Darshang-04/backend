
const User = require('../model/users')

exports.signup = async (req, res) => {
  if (req.method === 'POST') {
    const { name, username,email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(422).json({ error: 'Please fill in all fields' });
    }

    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(422).json({ error: 'Email already exists' });
      }

      // Create and save new user
      const newUser = new User({ name, username, email, password });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
