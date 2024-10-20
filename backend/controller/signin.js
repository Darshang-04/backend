const User = require("../model/users");
const jwt = require('jsonwebtoken')
const {jwt_secret} = require('../key')

exports.signin = async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({ error: 'Please fill in all fields' });
          }
          try{
            const saveduser = await User.findOne({email: email})
            if(!saveduser){
                res.status(500).json({err:"Incorrect email!"})
            }
            const ismatch = await User.findOne({password: password})
            if(!ismatch){
                res.status(500).json({err:"Incorrect password!"})
            }
            const token = jwt.sign({ id : saveduser._id}, jwt_secret)
            res.status(200).json({
              msg: 'Sign in successful',
              token,
            });
          }catch (error){
            res.status(500).json(error)
          }
    }else {
        res.status(404).json({ message: 'Method not allowed' });
      }
}

exports.logout = async(req, res)=>{
  res.clearCookie('token'); // Assuming the token is stored in a cookie named 'token'
  return res.status(200).json({ message: 'Logout successful' });
}