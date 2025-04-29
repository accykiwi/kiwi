export default async function handler(req, res) {
  const mintToCoingeckoId = {
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump": "fartcoin", // Fartcoin
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": "spx6900",  // SPX6900
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9": "gigachad", // GIGACHAD
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "usd-coin", // USDC
    "4k3Dyjzvzp8mZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": "raydium"   // RAY
  };

  const mints = Object.keys(mintToCoingeckoId);
  const ids = Object.values(mintToCoingeckoId).join(",");

  try {
    const coingeckoRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!coingeckoRes.ok) {
      console.error('Error fetching from CoinGecko:', await coingeckoRes.text());
      return res.status(500).json({ prices: {} });
    }

    const data = await coingeckoRes.json();
    const prices = {};

    for (const [mint, coingeckoId] of Object.entries(mintToCoingeckoId)) {
      prices[mint] = data[coingeckoId]?.usd ?? null;
    }

    return res.status(200).json({ prices });
  } catch (error) {
    console.error('Unexpected error fetching from CoinGecko:', error);
    return res.status(500).json({ prices: {} });
  }
}
