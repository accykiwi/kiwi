import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { mint } = req.query;

  if (!mint) {
    return res.status(400).json({ error: 'Missing mint address' });
  }

  try {
    // Step 1: Fetch token metadata from Jupiter
    const tokenInfoResponse = await fetch('https://cache.jup.ag/tokens');
    const tokenInfo = await tokenInfoResponse.json();

    const token = tokenInfo.find((t) => t.address === mint);

    if (!token) {
      return res.status(400).json({ error: 'Token metadata not found' });
    }

    const decimals = token.decimals;

    // Step 2: Fetch price quote
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=${mint}&amount=1000000`;

    const response = await fetch(quoteUrl);
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return res.status(500).json({ error: 'No route found for this token' });
    }

    const outAmount = data.data[0].outAmount;
    const normalizedOutAmount = outAmount / (10 ** decimals);

    const pricePerToken = 1 / normalizedOutAmount;

    res.status(200).json({ price: pricePerToken });
  } catch (error) {
    console.error('Proxy price error:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
}
