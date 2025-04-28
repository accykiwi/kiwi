export default async function handler(req, res) {
  const { mint } = req.query;

  if (!mint) {
    return res.status(400).json({ message: 'Missing mint address' });
  }

  try {
    const response = await fetch(`https://public-api.birdeye.so/market/token_price?address=${mint}`, {
      headers: {
        'Authorization': `Bearer 5e03e241b51b4ed3946001c68634ddcf`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Birdeye fetch failed:', await response.text());
      return res.status(response.status).json({ error: 'Birdeye API fetch failed' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server Error fetching price:', error);
    return res.status(500).json({ error: 'Server Error fetching price' });
  }
}
