const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Aucun article fourni.' });
    }

    const line_items = items.map(item => ({
      price: item.id,
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: process.env.SUCCESS_URL || 'https://yoursite.com/?success=1',
      cancel_url: process.env.CANCEL_URL || 'https://yoursite.com/',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'FR', 'DE', 'ES', 'IT', 'AU'],
      },
      phone_number_collection: { enabled: true },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('PlayFizz Backend OK'));

app.listen(process.env.PORT || 3000, () => console.log('Backend PlayFizz démarré'));
