export default async function handler(req, res) {
  const walletAddress = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";
  const solanaEndpoint = "https://api.mainnet-beta.solana.com";

  try {
    // 1. Fetch token accounts (NFTs included)
    const tokenRes = await fetch(solanaEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          walletAddress,
          { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
          { encoding: "jsonParsed" }
        ]
      })
    });

    const tokenData = await tokenRes.json();
    const accounts = tokenData?.result?.value || [];

    // 2. Filter NFT mint addresses
    const nftMints = accounts
      .filter(acc => {
        const info = acc?.account?.data?.parsed?.info;
        return info?.tokenAmount?.amount === "1" && info?.tokenAmount?.decimals === 0;
      })
      .map(acc => acc.account.data.parsed.info.mint);

    if (nftMints.length === 0) {
      return res.status(200).json({ positions: [] });
    }

    // 3. Fetch Raydium CLMM pools
    const poolRes = await fetch("https://api.raydium.io/v2/clmm/pools");
    const pools = await poolRes.json();

    const positions = [];

    for (const mint of nftMints) {
      // 4. Fetch NFT position info
      const infoRes = await fetch(`https://api.raydium.io/v2/clmm/position-info?mint=${mint}`);
      if (!infoRes.ok) continue;

      const info = await infoRes.json();
      const pool = pools.find(p => p.id === info.poolId);
      if (!pool) continue;

      // 5. Final token mints (real tokens only)
      const mintA = pool.mintA;
      const mintB = pool.mintB;

      const amountA = Number(info.liquidity) / 1e9;
      const amountB = Number(info.liquidity) / 1e9;

      // 6. Return only real mints (no NFT junk)
      positions.push({
        tokenA: mintA,
        tokenB: mintB,
        amountA,
        amountB,
        lowerPrice: tickIndexToPrice(info.tickLowerIndex, pool.decimalsA, pool.decimalsB),
        upperPrice: tickIndexToPrice(info.tickUpperIndex, pool.decimalsA, pool.decimalsB)
      });
    }

    return res.status(200).json({ positions });
  } catch (err) {
    console.error("LP fetch error:", err);
    return res.status(500).json({ positions: [] });
  }
}

// Convert tick index to price
function tickIndexToPrice(tickIndex, decimalsA, decimalsB) {
  const sqrt = Math.pow(1.0001, tickIndex / 2);
  return sqrt * sqrt * Math.pow(10, decimalsA - decimalsB);
}
