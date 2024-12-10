import userModel from "../models/userModel.js";
import validator from "validator";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendOtpEmail } from '../emailService.js';
const SECRET_KEY = process.env.JWT_SECRET


// Function to create a JWT token
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
}
// Route for user login
const loginUser = async (req, res,next) => {
    
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await userModel.findOne({ email }); // Use async/await for proper handling
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

   // Check if the user is blocked
   if (user.isBlocked) {
    return res.status(403).json({ success: false, userBlocked: true });
  }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Stored Password (hashed):", user.password);
console.log("Password from request:", password);
console.log("Password validation result:", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate the token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name:user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
    
  



const registerUser = async (req, res,next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists. Please log in.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Create new user in the database (unverified)
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      otp,
      isVerified: false,
      otpExpiresAt: Date.now() + 5 * 60 * 1000, // OTP valid for 5 minutes
    });
    await newUser.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(201).json({
      success: true,
      message: 'Account created. OTP sent to your email. Please verify to complete registration.',
      userId: newUser._id,
    });
  } catch (error) {
    next(error);
  }
};

const otpStore = new Map(); // Temporary in-memory store

// Generate OTP
async function generateAndStoreOtp(userId) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10); // Hash the OTP
    otpStore.set(userId, { hashedOtp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Store with expiry
    return otp; // Send plain OTP to the user
}

// Verify OTP Route
const verifyOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    // Get OTP data from store
    const data = otpStore.get(userId);
    console.log("Fetched OTP Data:", data);

    // Check if OTP exists and is not expired
    if (!data) {
      return res.json({ success: false, message: "OTP expired or invalid" });
    }

    const { hashedOtp, expiresAt } = data;

    // Check if OTP has expired
    if (Date.now() > data.expiresAt) {
      console.log("Current Time:", Date.now(), "Expiry Time:", data.expiresAt);
      otpStore.delete(userId);
      return res.json({ success: false, message: "OTP expired" });
    }

    // Compare provided OTP with stored hashed OTP
    const isValid = await bcrypt.compare(otp, hashedOtp);
    console.log("Validating OTP:", { providedOtp: otp, hashedOtp: data.hashedOtp, isValid });
    if (!isValid) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid; proceed with user verification
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Remove OTP from the store
    otpStore.delete(userId);

    res.json({ success: true, message: "Registration successful. You can now log in." });
  } catch (error) {
    next(error);
  }
};


// Resend OTP Route
const resendOtp = async (req, res,next) => {
    try {
        const { email } = req.body;
        console.log("Email received in resendOtp:", email);
        const user = await userModel.findOne({ email });
        if (!user){
          console.error("User not found with email:", email);
        return res.json({ success: false, message: "User not found" });
        }

        const otp = await generateAndStoreOtp(user._id.toString());
        await sendOtpEmail(email, otp);

        res.json({ success: true, message: "OTP resent to your email" });
    } catch (error) {
      next(error);
    }
};

// Forgot Password
const forgotPassword = async (req, res,next) => {
    try {
        const { email } = req.body;
        console.log("Email received in forgotPassword:", email); 
        const user = await userModel.findOne({ email });
        if (!user){
          console.error("User not found with email:", email);
          return res.status(404).json({ success: false, message: "User not found" });
        }

        const otp = await generateAndStoreOtp(user._id.toString());
        await sendOtpEmail(email, otp);

        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
      next(error);
    }
};

// Reset Password
const resetPassword = async (req, res,next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const data = otpStore.get(user._id.toString());
        if (!data || Date.now() > data.expiresAt) {
            return res.status(400).json({ success: false, message: "OTP expired or invalid" });
        }

        const isValid = await bcrypt.compare(otp, data.hashedOtp);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        otpStore.delete(user._id.toString());

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
      next(error);
    }
};

// Get User Profile
 const getUserProfile = async (req, res,next) => {
  try {
      const userId = req.user.id;

      const user = await userModel.findById(userId).select('-password');
      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Admin login route
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    console.log('Request Body:', req.body);
    console.log('Loaded Admin Email:', process.env.ADMIN_EMAIL);
    console.log('Loaded Admin Password:', process.env.ADMIN_PASSWORD);

    if (email !== process.env.ADMIN_EMAIL) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare plain-text password directly (if not hashed)
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for admin
    const token = jwt.sign(
        { userId: process.env.ADMIN_EMAIL, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
          id: 'admin', // Fixed ID for admin
          email: process.env.ADMIN_EMAIL,
          role: 'admin',
      },
  });
};

export { loginUser, registerUser, adminLogin, verifyOtp, resendOtp, getUserProfile,forgotPassword,resetPassword };
