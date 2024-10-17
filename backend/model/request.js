const mongoose = require("mongoose")
const {ObjectId} = mongoose.Schema.Types

const requestSchema = new mongoose.Schema({
    sender: { type: ObjectId, ref: 'User', required: true },
    receiver: { type: ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  });
  
  const Request = mongoose.model('Request', requestSchema);
  module.exports = Request;