export default async function handler(req, res) {
  const walletAddress = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";

  try {
    const response = await fetch(`https://api.raydium.io/v2/clmm/positions?owner=${walletAddress}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Error fetching Raydium LP positions:', await response.text());
      return res.status(500).json({ positions: [] });
    }

    const data = await response.json();

    const positions = data.positions || [];

    // For each LP NFT, pull meaningful details
    const parsedPositions = positions.map(pos => ({
      nftAddress: pos.nftAddress,
      poolId: pos.poolId,
      lowerPrice: pos.lowerPrice,
      upperPrice: pos.upperPrice,
      tokenA: pos.tokenA,
      tokenB: pos.tokenB,
      amountA: pos.amountA,
      amountB: pos.amountB,
      liquidity: pos.liquidity
    }));

    return res.status(200).json({ positions: parsedPositions });
  } catch (error) {
    console.error('Unexpected error fetching Raydium LPs:', error);
    return res.status(500).json({ positions: [] });
  }
}
