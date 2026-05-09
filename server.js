const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

const PRICE_IDS = {
  'p1-0': process.env.PRICE_P1_0,
  'p1-1': process.env.PRICE_P1_1,
  'p1-2': process.env.PRICE_P1_2,
  'p2-0': process.env.PRICE_P2_0,
  'p2-1': process.env.PRICE_P2_1,
  'p2-2': process.env.PRICE_P2_2,
  'p3-0': process.env.PRICE_P3_0,
  'p3-1': process.env.PRICE_P3_1,
  'p3-2': process.env.PRICE_P3_2,
  'p4-0': process.env.PRICE_P4_0,
  'p4-1': process.env.PRICE_P4_1,
  'p4-2': process.env.PRICE_P4_2,
  'p5-0': process.env.PRICE_P5_0,
  'p5-1': process.env.PRICE_P5_1,
  'p5-2': process.env.PRICE_P5_2,
  'p6-0': process.env.PRICE_P6_0,
  'p6-1': process.env.PRICE_P6_1,
  'p6-2': process.env.PRICE_P6_2,
  'p7-0': process.env.PRICE_P7_0,
  'p7-1': process.env.PRICE_P7_1,
  'p7-2': process.env.PRICE_P7_2,
  'p8-0': process.env.PRICE_P8_0,
  'p8-1': process.env.PRICE_P8_1,
  'p8-2': process.env.PRICE_P8_2,
};

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    for (const item of items) {
      if (!PRICE_IDS[item.id]) {
        return res.status(400).json({ error: 'Produit inconnu : ' + item.id });
      }
    }

    const line_items = items.map(item => ({
      price: PRICE_IDS[item.id],
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
