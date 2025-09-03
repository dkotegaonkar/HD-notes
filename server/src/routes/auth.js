const express = require("express");
const OtpModel = require("../models/Otp");
const UserModel = require("../models/User");
const { sendBrevoEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const router = express.Router();

const makeJwt = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );
    await sendBrevoEmail({
      toEmail: email,
      toName: name,
      subject: "Your HD Notes OTP",
      htmlContent: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
      textContent: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });
    return res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, name } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Missing fields" });

    const record = await OtpModel.findOne({ email });
    if (!record)
      return res.status(400).json({ error: "OTP not found. Request new one." });

    if (record.expiresAt < new Date()) {
      await OtpModel.deleteOne({ email });
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });

    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({ email, name });
    }
    await OtpModel.deleteOne({ email });
    const token = makeJwt(user);
    return res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

// Google OAuth entry
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  (req, res) => {
    const user = req.user;
    const token = makeJwt(user);
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173/notes";
    // redirect with token in hash (not ideal for production but simple)
    return res.redirect(`${frontend}/auth-success#token=${token}`);
  }
);

router.get("/google/failure", (req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
});

module.exports = router;
