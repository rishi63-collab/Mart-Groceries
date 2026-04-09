const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ================= CREATE PAYMENT =================
router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // paisa
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= SAVE ORDER =================
router.post("/save", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const crypto = require("crypto");

// ================= VERIFY PAYMENT =================
router.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }
});

module.exports = router;
