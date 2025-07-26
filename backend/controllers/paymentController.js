const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', courseId } = req.body;

    if (!amount || !courseId) {
      return res.status(400).json({ error: 'Amount and courseId are required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // amount in cents or smallest currency unit
      currency,
      metadata: {
        userId: req.user.id,
        courseId,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
