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

  const dexScreenerPages = {
    "J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr": "https://dexscreener.com/solana/2wZGhBRVZutphN1Y5AXbVCZxZ62pysez3zrNVqGfTHFS", // SPX pool page
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9": "https://dexscreener.com/solana/4twnR1chjTTzoEFcpY5jaCzLfZCgjZL3tNN81GuuhBGe"  // GIGA pool page
  };

  const prices = {};

  for (const [mint, decimals] of Object.entries(tokenMints)) {
    if (mint === USDC_MINT) {
      prices[mint] = 1.0;
      continue;
    }

    if (mint in dexScreenerPages) {
      // Special case: scrape from Dexscreener web page
      try {
        const pageUrl = dexScreenerPages[mint];
        const res = await fetch(pageUrl);

        if (res.ok) {
          const html = await res.text();
          const match = html.match(/"priceUsd":([0-9.]+)/);

          if (match && match[1]) {
            prices[mint] = parseFloat(match[1]);
            continue;
          } else {
            console.error(`Price parsing failed for ${mint}`);
            prices[mint] = null;
            continue;
          }
        } else {
          console.error(`Dexscreener fetch failed for ${mint}:`, await res.text());
          prices[mint] = null;
          continue;
        }
      } catch (err) {
        console.error(`Error scraping Dexscreener for ${mint}:`, err);
        prices[mint] = null;
        continue;
      }
    }

    // Normal case: fetch from Birdeye for Fartcoin etc
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
        } else {
          prices[mint] = null;
        }
      } else {
        console.error(`Birdeye fetch failed for ${mint}:`, await birdeyeRes.text());
        prices[mint] = null;
      }
    } catch (err) {
      console.error(`Error fetching from Birdeye for ${mint}:`, err);
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
