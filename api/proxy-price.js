export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const tokenMints = {
    "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump": 6, // Fartcoin
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": 9, // SPX6900
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9": 9, // GIGACHAD
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 6, // USDC
    "4k3Dyjzvzp8mZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": 6  // RAY
  };

  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const birdeyeApiKey = "5e03e241b51b4ed3946001c68634ddcf";

  const prices = {};

  for (const [mint, decimals] of Object.entries(tokenMints)) {
    if (mint === USDC_MINT) {
      prices[mint] = 1.0;
      continue;
    }

    // Try Birdeye First
    try {
      const birdeyeRes = await fetch(`https://public-api.birdeye.so/public/price?address=${mint}`, {
        headers: {
          'Authorization': `Bearer ${birdeyeApiKey}`,
          'Accept': 'application/json'
        }
      });

      if (birdeyeRes.ok) {
        const birdeyeData = await birdeyeRes.json();
        if (birdeyeData?.data?.value) {
          prices[mint] = parseFloat(birdeyeData.data.value);
          continue;
        }
      } else {
        console.error(`Birdeye fetch failed for ${mint}:`, await birdeyeRes.text());
      }
    } catch (err) {
      console.error(`Error fetching from Birdeye for ${mint}:`, err);
    }

    // Fallback to Jupiter
    try {
      const amount = Math.pow(10, decimals);
      const jupiterRes = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${mint}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=50`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (jupiterRes.ok) {
        const jupiterData = await jupiterRes.json();
        if (jupiterData?.outAmount) {
          const outAmount = Number(jupiterData.outAmount) / 1e6; // USDC always 6 decimals
          prices[mint] = outAmount;
        } else {
          prices[mint] = null;
        }
      } else {
        console.error(`Jupiter fetch failed for ${mint}:`, await jupiterRes.text());
        prices[mint] = null;
      }
    } catch (err) {
      console.error(`Error fetching from Jupiter for ${mint}:`, err);
      prices[mint] = null;
    }
  }

  return new Response(JSON.stringify({ prices }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
