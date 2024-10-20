require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io')
const PortNo = 8000; // Ensure 'mongoUrl' is correctly exported from './key'
const mongoose = require('mongoose');
const database = process.env.MONGODB_URI

const server = http.createServer(app);
const io = new Server(server);
const cors = require('cors')
app.use(cors());
require('./model/users.js'); // Ensure the model is correctly exported and has valid schema
require('./model/post.js'); // Ensure the model is correctly exported and has valid schema
const loginrequire = require('./middleware/loginrequire.js')
const signupapi= require('./controller/signup.js')
const signinapi = require('./controller/signin.js')
const profilepic = require('./controller/profile.js')
const profilePic = require('./controller/profile.js')
const userposts = require('./controller/profile.js')
const allposts = require('./controller/profile.js')
const likepost = require('./controller/profile.js')
const userlikes = require('./controller/profile.js')
const comments = require('./controller/profile.js')
const getcomment = require('./controller/profile.js')
const UserProfile = require('./controller/profile.js')
const userfollwer = require('./controller/profile.js')
const requests = require('./controller/request.js')


app.use(express.json());
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for a comment being sent
  socket.on('send-comment', (commentData) => {
    // Broadcast the comment to all users in real-time
    io.emit('receive-comment', commentData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});




// MongoDB Connection
mongoose.connect(database)
.then(() => {
  console.log('Successfully connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});


app.post('/api/signup', signupapi.signup)
app.post('/api/signin', signinapi.signin)
app.post('/api/logout', signinapi.logout)
app.put('/api/profilepic', loginrequire, profilepic.profile)
app.get(`/api/profilepic/:userId`, loginrequire,profilePic.profilepic)
app.post('/api/userposts', loginrequire,userposts.createPost);
app.get('/api/userposts/:userId', loginrequire,userposts.getUserPosts);
app.get('/api/allposts', allposts.allposts)
app.put('/api/like/:postId', loginrequire,likepost.likes)
app.put('/api/unlike/:postId', loginrequire,likepost.unlike)
app.get('/api/user/:userId/liked-posts', userlikes.getUserLikedPosts)
app.post('/api/:id/comment', loginrequire,comments.comments) 
app.get('/api/comment/:id', loginrequire,getcomment.getPostWithComments)
app.get('/api/profile/:id', loginrequire, UserProfile.UserProfile)
app.put('/api/follower', userfollwer.followers)
app.put('/api/unfollower', userfollwer.unfollower)
app.get('/api/isfollowing/:userId/:profileId', loginrequire,userfollwer.checkFollower)
app.post('/api/send-request', requests.Send)
app.post('/api/request/users', requests.requestuser)
app.post('/api/accept-request', requests.Accept)
app.post('/api/reject-request', requests.Reject)



  app.listen(PortNo, () => {
    console.log(`Server started at port number ${PortNo}`);
  });
