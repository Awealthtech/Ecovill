const nodemailer = require("nodemailer");
const OTP = require("../models/otpModel");

// Function to send OTP via email
class OTPController {
  // sendOtp verified page
  static async sendOtpGet(req, res) {
    res.json({message:"sendOtp get});
  }
  // otpVerificationGet
  static async otpVerificationGet(req, res) {
   res.json({message:"sendOtp get});
  }

  static async sendOTP(req, res) {
    const { email } = req.body;
    const existingUser = await OTP.findOne({ email });
    if (existingUser) {
      res
        .status(400)
        .json({ message: "user already exists,try another email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP

    // Save the OTP to the database
    const otpInstance = new OTP({ email, otp });
    await otpInstance.save();

    // Send the OTP via email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Your OTP",
      text: `Your OTP is ${otp}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("OTP sent via email");
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.log("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  }

  static async verifyOTP(req, res) {
    const { email, otp } = req.body;

    // Find the OTP from the database
    const savedOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!savedOTP) {
      res.status(400).json({ error: "OTP not found or expired" });
    }

    if (otp === savedOTP.otp) {
      // OTP is valid
      // res.render("userinfo", { error: "" });
      console.log("otp verified")
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      // Invalid OTP
      res.status(400).json({ error: "Invalid OTP" });
    }
  }
}

module.exports = OTPController;
