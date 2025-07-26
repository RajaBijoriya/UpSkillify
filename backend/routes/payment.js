const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const bodyParser = require('body-parser');
const Enrollment = require('../models/Enrollment');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Must use raw body for webhook verification
router.post('/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;
      const courseId = paymentIntent.metadata.courseId;

      // Mark enrollment as paid or create enrollment if not exists
      try {
        let enrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (!enrollment) {
          enrollment = new Enrollment({
            user: userId,
            course: courseId,
            progress: 0,
            paymentStatus: 'paid',
          });
        } else {
          enrollment.paymentStatus = 'paid';
        }
        await enrollment.save();
        console.log('Enrollment updated with payment success');
      } catch (error) {
        console.error('Error updating enrollment on payment success:', error);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
