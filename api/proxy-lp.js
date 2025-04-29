export default async function handler(req, res) {
  const walletAddress = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";
  const solanaEndpoint = "https://api.mainnet-beta.solana.com";

  try {
    // Step 1: Get token accounts from wallet
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
    const tokenAccounts = tokenData?.result?.value || [];

    // Step 2: Identify NFT LPs (Raydium CLMM positions)
    const nftMints = tokenAccounts
      .filter(acc => {
        const info = acc?.account?.data?.parsed?.info;
        return info?.tokenAmount?.amount === "1" && info?.tokenAmount?.decimals === 0;
      })
      .map(acc => acc.account.data.parsed.info.mint);

    if (nftMints.length === 0) {
      return res.status(200).json({ positions: [] });
    }

    // Step 3: Fetch Raydium pool list
    const poolsRes = await fetch('https://api.raydium.io/v2/clmm/pools');
    const pools = await poolsRes.json();

    const positions = [];

    for (const mint of nftMints) {
      // Step 4: Fetch position-info for the NFT
      const posRes = await fetch(`https://api.raydium.io/v2/clmm/position-info?mint=${mint}`);
      if (!posRes.ok) continue;

      const info = await posRes.json();
      const pool = pools.find(p => p.id === info.poolId);
      if (!pool) continue;

      // Step 5: Add only real token mints back
      const liquidity = Number(info.liquidity);
      const amountA = liquidity / 1e9;
      const amountB = liquidity / 1e9;

      positions.push({
        tokenA: pool.mintA, // ✅ SOL, Fartcoin, or USDC
        tokenB: pool.mintB,
        lowerPrice: tickIndexToPrice(info.tickLowerIndex, pool.decimalsA, pool.decimalsB),
        upperPrice: tickIndexToPrice(info.tickUpperIndex, pool.decimalsA, pool.decimalsB),
        amountA,
        amountB
      });
    }

    return res.status(200).json({ positions });
  } catch (err) {
    console.error("LP fetch error:", err);
    return res.status(500).json({ positions: [] });
  }
}

// Tick index to price
function tickIndexToPrice(tickIndex, decimalsA, decimalsB) {
  const sqrt = Math.pow(1.0001, tickIndex / 2);
  return sqrt * sqrt * Math.pow(10, decimalsA - decimalsB);
}
