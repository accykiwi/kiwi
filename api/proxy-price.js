export default async function handler(req, res) {
  const { mint } = req.query;

  if (!mint) {
    return res.status(400).json({ message: 'Missing mint address' });
  }

  try {
    const response = await fetch(`https://public-api.birdeye.so/market/token_price?address=${mint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer 5e03e241b51b4ed3946001c68634ddcf`
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch price from Birdeye:', response.status);
      return res.status(response.status).json({ message: 'Failed fetching from Birdeye' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
