const mongoose = require('mongoose');
const User = require("../model/users");
const POST = require('../model/post');
const Request = require('../model/request');

exports.Send = async (req, res) => {
    const { senderId, receiverId } = (req.body); // Ensure body is parsed correctly

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'Sender or Receiver ID missing' });
  }

  try {
    console.log(senderId, receiverId)
    // Find sender and receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add sender to receiver's receivedRequests, and vice versa
    sender.sendRequests.push(receiverId);
    receiver.receivedRequests.push(senderId);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }
  }

exports.requestuser = async (req, res) => {
    const { userIds } = req.body;
  
    try {
      const users = await User.find({ _id: { $in: userIds } }, 'username photo');
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Accept connection request
  exports.Accept = async (req, res) => {
    const { userId, requesterId } = req.body;
  
    try {
      const user = await User.findById(userId);
      const requester = await User.findById(requesterId);
  
      // Remove request from received and sent arrays
      user.receivedRequests.pull(requesterId);
      requester.sendRequests.pull(userId);
  
      // Add to each other's connections
      user.connections.push(requesterId);
      requester.connections.push(userId);
  
      await user.save();
      await requester.save();
  
      res.status(200).json({ message: 'Request accepted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to accept request' });
    }
  }
  
  // Reject connection request
exports.Reject = async (req, res) => {
    const { userId, requesterId } = req.body;
  
    try {
      const user = await User.findById(userId);
      const requester = await User.findById(requesterId);
  
      // Remove request from both users' request fields
      user.receivedRequests.pull(requesterId);
      requester.sendRequests.pull(userId);
  
      await user.save();
      await requester.save();
  
      res.status(200).json({ message: 'Request rejected' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reject request' });
    }
  };
  
