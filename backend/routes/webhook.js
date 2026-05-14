import express from 'express';
import Stripe from 'stripe';
import Goal from '../models/Goal.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
let stripe;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

// This route must use express.raw({ type: 'application/json' }) before express.json()
router.post('/stripe', async (req, res) => {
  if (!stripe) {
    return res.status(400).send('Stripe is not configured.');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Requires STRIPE_WEBHOOK_SECRET to be set
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      console.error('⚠️ Stripe Webhook Error: STRIPE_WEBHOOK_SECRET is missing');
      return res.status(400).send('Webhook secret missing');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Stripe Webhook Signature Verification Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Retrieve metadata passed during session creation
    const { goalId, userId, amount, note } = session.metadata || {};

    if (goalId && amount) {
      try {
        const goal = await Goal.findById(goalId);
        if (goal) {
          // Add contribution to the goal
          goal.contributors.push({
            memberId: userId,
            memberName: session.customer_details?.name || 'Family Member',
            amount: Number(amount),
            note: note || 'Stripe Payment',
            type: 'one-time'
          });
          
          await goal.updateCurrentAmount();
          console.log(`✅ Successfully updated goal ${goalId} with payment of ${amount}`);
        }
      } catch (err) {
        console.error('Error updating goal from webhook:', err);
      }
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

export default router;
