import cloudinary from "../lib/cloudinary.js";
import Story from "../models/story.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(209).json(filteredUsers);
  } catch (error) {
    console.log("Error in getuserForSlider", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // Get userToChatId from URL params
    const myId = req.user._id; // Get logged-in user's ID

    // Validate userToChatId
    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Query the database
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessage controller", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      //upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    //realtime functionality goes here => socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const uploadStory = async (req, res) => {
  try {
    const { story } = req.body;
    // console.log("Story is" , story);
    // console.log("token is", req.cookies.jwt);

    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded is: ", decoded);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    // console.log("User from jwt token is: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user._id;
    const username = user.fullName;

    if (!story) {
      return res.status(400).json({ message: "Story is required" });
    }

    // Ensure req.user is defined
    if (!userId || !username) {
      return res.status(400).json({ message: "User information is missing" });
    }

    // Upload the story to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(story, {
      resource_type: "auto", // (image/video)
    });

    // Create a new story in the database
    const newStory = await Story.create({
      userId,
      username,
      mediaUrl: uploadResponse.secure_url,
    });

    newStory.save();

    // Respond with the created story
    res.status(201).json({ message: "Status created successfully" });
  } catch (error) {
    console.log("Error in uploadStory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add Fetch Stories Function
export const getStories = async (req, res) => {
  // console.log("controller calling")
    try {
    const userId = req.query.userId;
    // console.log("User ID from protected middleware:", userId);

    // const user = await User.findById({ userId });
    // const username = user.fullName;
    

    // if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ message: "Invalid user ID" });
    // }

    // Fetch stories for the specific user
    const stories = await Story.find();
    // console.log(stories)

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
};
