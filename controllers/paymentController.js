// controllers/paymentController.js
const axios = require('axios');
const Payment = require('../models/Payment');
const dotenv = require('dotenv');
dotenv.config();

const paystackApi = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  },
});

async function makePayment(req, res) {
  try {
    const { email, amount } = req.body;
    const response = await paystackApi.post('/transaction/initialize', {
      email,
      amount: amount * 100, // Paystack expects amount in kobo (i.e., 100 kobo = 1 Naira)
    });

    // Save payment details to MongoDB
    const payment = new Payment({
      email,
      amount,
      reference: response.data.data.reference,
      status: 'pending',
    });
    await payment.save();

    res.json({ authorization_url: response.data.data.authorization_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while initializing payment.' });
  }
}

async function verifyPayment(req, res) {
  try {
    const { reference } = req.query;
    const verifyResponse = await paystackApi.get(`/transaction/verify/${reference}`);
    if (verifyResponse.data.data.status === 'success') {
      const payment = await Payment.findOneAndUpdate(
        { reference },
        { status: 'success' },
        { new: true }
      );
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found.' });
      }
      res.json({ message: 'Payment verified successfully.' });
    } else {
      res.status(400).json({ error: 'Payment verification failed.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while verifying payment.' });
  }
}

module.exports = {
  makePayment,
  verifyPayment,
};
