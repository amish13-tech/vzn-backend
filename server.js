const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(cors());
app.use(express.json());

const PRICE_IDS = {
  'bodrum-1':    process.env.PRICE_BODRUM_1,
  'bodrum-2':    process.env.PRICE_BODRUM_2,
  'bodrum-3':    process.env.PRICE_BODRUM_3,
  'bodrum-4':    process.env.PRICE_BODRUM_4,
  'bodrum-5':    process.env.PRICE_BODRUM_5,
  'bodrum-6':    process.env.PRICE_BODRUM_6,
  'bodrum-7':    process.env.PRICE_BODRUM_7,
  'bodrum-8':    process.env.PRICE_BODRUM_8,
  'bento-1':     process.env.PRICE_BENTO_1,
  'bento-2':     process.env.PRICE_BENTO_2,
  'bento-3':     process.env.PRICE_BENTO_3,
  'espion-1':    process.env.PRICE_ESPION_1,
  'espion-2':    process.env.PRICE_ESPION_2,
  'espion-3':    process.env.PRICE_ESPION_3,
  'marbella-1':  process.env.PRICE_MARBELLA_1,
  'marbella-2':  process.env.PRICE_MARBELLA_2,
  'marseille-1': process.env.PRICE_MARSEILLE_1,
  'marseille-2': process.env.PRICE_MARSEILLE_2,
  'marseille-3': process.env.PRICE_MARSEILLE_3,
  'marseille-4': process.env.PRICE_MARSEILLE_4,
  'marseille-5': process.env.PRICE_MARSEILLE_5,
  'marseille-6': process.env.PRICE_MARSEILLE_6,
  'marseille-7': process.env.PRICE_MARSEILLE_7,
  'miami-1':     process.env.PRICE_MIAMI_1,
  'miami-2':     process.env.PRICE_MIAMI_2,
  'miami-3':     process.env.PRICE_MIAMI_3,
  'miami-4':     process.env.PRICE_MIAMI_4,
  'miami-5':     process.env.PRICE_MIAMI_5,
  'miami-6':     process.env.PRICE_MIAMI_6,
  'octo-1':      process.env.PRICE_OCTO_1,
  'octo-2':      process.env.PRICE_OCTO_2,
  'octo-3':      process.env.PRICE_OCTO_3,
  'octo-4':      process.env.PRICE_OCTO_4,
  'octo-5':      process.env.PRICE_OCTO_5,
  'octo-6':      process.env.PRICE_OCTO_6,
  'santorini-1': process.env.PRICE_SANTORINI_1,
  'santorini-2': process.env.PRICE_SANTORINI_2,
  'oslow-1':     process.env.PRICE_OSLOW_1,
  'oslow-2':     process.env.PRICE_OSLOW_2,
  'oslow-3':     process.env.PRICE_OSLOW_3,
  'tokyo-1':     process.env.PRICE_TOKYO_1,
  'tokyo-2':     process.env.PRICE_TOKYO_2,
  'tokyo-3':     process.env.PRICE_TOKYO_3,
  'viper-1':     process.env.PRICE_VIPER_1,
  'viper-2':     process.env.PRICE_VIPER_2,
  'viper-3':     process.env.PRICE_VIPER_3,
  'viper-4':     process.env.PRICE_VIPER_4,
  'viper-5':     process.env.PRICE_VIPER_5,
  'viper-6':     process.env.PRICE_VIPER_6,
  'viper-7':     process.env.PRICE_VIPER_7,
};

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    for (const item of items) {
      if (!PRICE_IDS[item.id]) {
        return res.status(400).json({ error: 'Produit inconnu : ' + item.id });
      }
    }

    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const freeUnits = Math.floor(totalQty / 3);
    const discountAmount = freeUnits * 1990;

    const line_items = items.map(item => ({
      price: PRICE_IDS[item.id],
      quantity: item.quantity,
    }));

    const sessionData = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://vznriviera.com/?success=1',
      cancel_url:  'https://vznriviera.com/',
      shipping_address_collection: {
    allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
  },
    };

    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmount,
        currency: 'eur',
        name: `${freeUnits} paire${freeUnits > 1 ? 's' : ''} offerte${freeUnits > 1 ? 's' : ''}`,
        duration: 'once',
      });
      sessionData.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('VZN Backend OK'));
app.listen(process.env.PORT || 3000, () => console.log('Backend VZN démarré'));
