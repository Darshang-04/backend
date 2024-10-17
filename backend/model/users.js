const mongoose = require("mongoose")
const {ObjectId} = mongoose.Schema.Types

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    photo:{
        type:String,
        require: true
    },
    followers:[{
        type: String,
        ref: "User"
    }],
    followings:[{
        type: String,
        ref:"User"
    }],
    sendRequests:[{
        type: ObjectId,
        ref: "User"
    }],
    receivedRequests:[{
        type: ObjectId,
        ref: "User"
    }],
    connections:[{
        type: ObjectId,
        ref: "User"
    }],
})

const User = mongoose.model('User', UserSchema);

module.exports = User;