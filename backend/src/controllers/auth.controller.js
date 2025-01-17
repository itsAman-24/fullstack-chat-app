import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import TempUser from "../models/temp.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { sendVerificationCode, sendWelcomeEmail } from "../middleware/verificationCode.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log("Request received:", { fullName, email, password });

  try {
    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if the email already exists in the verified Users collection
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if the email already exists in the TempUser collection
    const tempUserExists = await TempUser.findOne({ email });
    if (tempUserExists) {
      return res.status(400).json({ message: "A verification email has already been sent" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully");

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save user details in the TempUser collection
    const tempUser = new TempUser({
      fullName,
      email,
      password: hashedPassword,
      verificationCode,
    });

    await tempUser.save();
    console.log("Temporary user saved:", tempUser);

    // Send the verification code to the user's email
    await sendVerificationCode(tempUser.email, tempUser.verificationCode);
    // console.log("Verification code sent successfully");

    res.status(201).json({
      message: "Verification email sent. Please check your inbox to verify your account.",
    });
  } catch (error) {
    console.error("Error in signup controller:", error.stack);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });

    if (!tempUser) {
      return res.status(400).json({ message: "User not found" });
    }

    if (tempUser.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Move the user to the User collection or mark as verified
    const newUser = new User({
      fullName: tempUser.fullName,
      email: tempUser.email,
      password: tempUser.password,
    });

    await newUser.save();
    await TempUser.deleteOne({ email });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });


  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    // console.log(profilePic);
    
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
