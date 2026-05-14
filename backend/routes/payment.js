import express from 'express';
import Stripe from 'stripe';
import auth from '../middleware/auth.js';
import dotenv from 'dotenv';
import Goal from '../models/Goal.js';
import Family from '../models/Family.js';

dotenv.config();

const router = express.Router();

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { amount, goalId, note } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured on the server.' });
    }

    // Replace req.user.familyId check with Family patriarch validation
    const family = await Family.findById(goal.familyId);
    const isMember = family && (family.patriarch.toString() === req.user._id.toString() || family.members.some(m => m.userId?.toString() === req.user._id.toString()));
    if (!isMember) {
      return res.status(403).json({ message: 'Goal not found or unauthorized' });
    }

    // Amount is coming in Rupees. Stripe needs lowest denomination (paise)
    const unitAmount = Math.round(Number(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Contribution to ${goal.name}`,
              description: note || 'FamilyPool Goal Contribution',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/goals?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/goals?canceled=true`,
      metadata: {
        goalId: goalId,
        userId: req.user._id.toString(),
        familyId: family._id.toString(),
        note: note || '',
        amount: Number(amount)
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ message: 'Payment gateway error', error: error.message });
  }
});

// A webhook route would typically go here to listen to 'checkout.session.completed'
// and permanently update the `currentAmount` in the DB securely.

export default router;
