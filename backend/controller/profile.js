// Import necessary modules
const mongoose = require('mongoose');
const cloudinary = require("../lib/cloudinary");
const User = require("../model/users");
const POST = require('../model/post');


exports.UserProfile = async (req, res) => {
  try {
    // Fetch the user details (without the password)
    const user = await User.findById(req.params.id).select('-password');
    
    // Check if user is found
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch posts created by the user
    const posts = await POST.find({ postedBy: req.params.id })
      .populate('postedBy', '_id name photo')  // Populate postedBy with user details
      .populate('likes', '_id')  // Optionally populate likes with user ID or details
      .populate('comments.postedBy', '_id name username'); // Populate comments' postedBy field with user details

    // Send the user and posts as a single JSON object
    res.json({ user, posts });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload profile picture
exports.profile = async (req, res) => {
  if (req.method === 'PUT') {
    try {
      const { userId, photo } = req.body;

      // Upload the photo to Cloudinary
      const uploadedImage = await cloudinary.uploader.upload(photo, {
        folder: 'user_profiles',
        public_id: `user_${userId}`,
        overwrite: true,
      });

      const photoUrl = uploadedImage.secure_url;
      // console.log(photoUrl)

      // Update the user’s profile picture
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { photo: photoUrl } },
        { new: true }
      );

      res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ success: false, message: 'Upload failed', error });
    }
  } else {
    res.status(405).json({ message: 'Only PUT requests are allowed' });
  }
};

// Fetch a user profile picture
exports.profilepic = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving user', error });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, photo, price, description, author, book_type, postedBy } = req.body;

    if (!title || !photo || !price || !description || !author || !book_type || !postedBy) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newPost = new POST({
      title,
      photo,
      price,
      description,
      author,
      book_type,
      postedBy
    });

    await newPost.save();

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Error creating post', error });
  }
};

// Fetch all posts for a particular user
exports.getUserPosts = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await POST.find({ postedBy: userId })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id username");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.allposts = async(req,res)=>{
  try {
    const posts = await POST.find()
    .populate("postedBy", "_id name photo")
    .populate("comments.postedBy", "_id username")
    .sort('-createdAt')
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

exports.likes = async(req, res)=>{
  try {
    const postId = req.params.postId;
    const userId = req.body.userId;

    // console.log("postId:", postId);

    // Check if postId is a valid ObjectId
    if (!mongoose.isValidObjectId(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const post = await POST.findByIdAndUpdate(
        postId,
        { $push: { likes: userId } },  // Add userId to the likes array
        { new: true }
    );

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({message: "Liked"});
} catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
}
}

exports.unlike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.body.userId;

    // Validate postId
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Validate userId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Ensure userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Update the post by removing the userId from the likes array
    const post = await POST.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },  // Remove userId from the likes array
      { new: true }  // Return the updated document
    );

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Unlike successful', post });
  } catch (error) {
    console.error("Error unliking post:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserLikedPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all posts that have been liked by this user
    const likedPosts = await POST.find({likes: userId})
    .populate('likes')

    if (!likedPosts) {
      return res.status(404).json({ message: 'No liked posts found for this user' });
    }

    res.status(200).json(likedPosts);
    // console.log(likedPosts)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.comments = async (req, res) => {
  try {
    const postedBy = req.body.userId;  // Extract userId from the request body
    const commentText = req.body.text;  // Extract comment text from the request body

    // console.log("Posted by:", postedBy);
    
    // Validate that both the user ID and comment text are provided
    if (!postedBy || !commentText) {
      return res.status(400).json({ message: "User ID and comment text are required" });
    }

    // Find the post by ID and push the new comment into the comments array
    const post = await POST.findByIdAndUpdate(
      req.params.id,  // Post ID from the URL parameters
      {
        $push: {
          comments: { 
            comment: commentText,  // Comment text
            postedBy: postedBy     // User ID
          }
        }
      },
      { new: true }  // Return the updated post
    ).populate("comments.postedBy", "username")
    // Check if the post was found
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Successfully commented", post });
  } catch (error) {
    console.error("Error while commenting:", error.message);
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};

exports.getPostWithComments = async (req, res) => {
  try {
    const post = await POST.findById(req.params.id)
    .populate('postedBy', '_id name photo')  // Populate postedBy with user details
    .populate('comments.postedBy', '_id name username photo')  // Populate comments with postedBy's username
    .exec();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);  // Return the post with its comments
  } catch (error) {
    console.error("Error fetching post with comments:", error.message);
    res.status(500).json({ message: "Failed to fetch post", error: error.message });
  }
};

exports.followers = async(req, res)=>{
  try {
    const { userId, followId } = req.body;
    const user = await User.findByIdAndUpdate(
      followId,
      { $addToSet: { followers: userId } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { followings: followId } },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

exports.unfollower = async(req, res)=>{
  try {
    const { userId, unfollowId } = req.body;
    if (!userId || !unfollowId) {
      return res.status(400).json({ message: 'Invalid user data' });
    }
    const user = await User.findByIdAndUpdate(
      unfollowId,
      { $pull: { followers: userId } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $pull: { followings: unfollowId } },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

exports.checkFollower = async (req, res) => {
  try {
    const { userId, profileId } = req.params;

    const user = await User.findById(userId);
    const isFollowing = user.followings.includes(profileId);
    res.json({ isFollowing });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
