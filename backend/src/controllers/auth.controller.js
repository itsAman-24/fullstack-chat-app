import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { sendVerificationCode, sendWelcomeEmail } from "../middleware/verificationCode.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log("Request received:", { fullName, email, password });

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    console.log("Salt generated");

    const hashedPassword = await bcrypt.hash(password, salt);
    //Generating verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("Password hashed:", hashedPassword);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationCode
    });

    await newUser.save();

    //sending verification code to the user registerrd
    await sendVerificationCode(newUser.email, newUser.verificationCode);

    // res.redirect("")
    // console.log("New user saved:", newUser);

    generateToken(newUser._id, res);
    console.log("Token generated successfully");

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic || null,
    });

    // history.push("/verify");
  } catch (error) {
    console.error("Error in signup controller:", error.stack);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({verificationCode: code});

    if(!user) {
      return res.status(400).json({success: false, message: "Invalid or Expired Code"});
    }

    user.isVarified = true;
    user.verificationCode = undefined;

    await user.save();
    await sendWelcomeEmail(user.email, user.fullName);
    return res.status(200).json({success: true, message: "Email verified successfully"});


  } catch (error) {
    console.log(error)
    return res.status(500).json({success: false, message: "Internal server error"});
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
