import fetch from 'node-fetch';

const TOKEN_DECIMALS = {
  '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump': 9, // Fartcoin
  'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr': 9, // SPX6900
  '63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9': 9, // GIGACHAD
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 6, // USDC
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 6, // RAY
};

export default async function handler(req, res) {
  const { mint } = req.query;

  if (!mint || !TOKEN_DECIMALS[mint]) {
    return res.status(400).json({ error: 'Invalid mint address' });
  }

  try {
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=${mint}&amount=1000000`; 
    // input amount = 1 USDC (1e6 because USDC has 6 decimals)

    const response = await fetch(quoteUrl);
    const data = await response.json();

    const outAmount = data.data[0].outAmount; // Get first route's outAmount
    const decimals = TOKEN_DECIMALS[mint];
    const normalizedOutAmount = outAmount / (10 ** decimals);

    const pricePerToken = 1 / normalizedOutAmount;

    res.status(200).json({ price: pricePerToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
}
