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

// Use FRONTEND_ORIGIN or FRONTEND_URL — whichever is set on Render/Netlify
const FRONTEND_URL = process.env.FRONTEND_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { amount, goalId, note } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured on the server.' });
    }

    const family = await Family.findById(goal.familyId);
    const isMember = family && (
      family.patriarch.toString() === req.user._id.toString() ||
      family.members.some(m => m.userId?.toString() === req.user._id.toString())
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Goal not found or unauthorized' });
    }

    // Amount comes in Rupees. Stripe needs paise (lowest denomination). Min is 50 paise = ₹0.50
    const unitAmount = Math.round(Number(amount) * 100);
    if (unitAmount < 50) {
      return res.status(400).json({ message: 'Minimum contribution amount is ₹1' });
    }

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
        // Stripe requires ALL metadata values to be strings
        goalId: String(goalId),
        userId: String(req.user._id),
        familyId: String(family._id),
        note: note || '',
        amount: String(Number(amount))
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error.message);
    res.status(500).json({ message: 'Payment gateway error', error: error.message });
  }
});

export default router;
