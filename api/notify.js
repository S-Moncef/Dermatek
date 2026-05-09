export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { order, items, address, phone, wilaya, total, payment_method } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'DERMATEK <onboarding@resend.dev>',
        to: 'dermatek.admin@gmail.com',
        subject: '🛒 Nouvelle commande DERMATEK',
        html: `
          <h2>Nouvelle commande reçue!</h2>
          <p><strong>Commande #${order.id}</strong></p>
          <hr/>
          <h3>Client</h3>
          <p>📍 ${wilaya} — ${address}</p>
          <p>📞 ${phone}</p>
          <p>💳 ${payment_method === 'cod' ? 'Paiement à la livraison' : 'Carte'}</p>
          <hr/>
          <h3>Produits</h3>
          <ul>
            ${items.map(item => `<li>${item.quantity}x ${item.name} — ${item.price} DZD</li>`).join('')}
          </ul>
          <hr/>
          <h3>Total: ${total} DZD</h3>
        `
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Notify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
