export default async function handler(req, res) {
  const walletAddress = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";
  const solanaEndpoint = "https://api.mainnet-beta.solana.com";

  try {
    // Step 1: Fetch wallet token accounts
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

    // Step 2: Filter LP NFTs
    const nftAccounts = tokenAccounts.filter(acc => {
      const info = acc?.account?.data?.parsed?.info;
      return info?.tokenAmount?.amount === "1" && info?.tokenAmount?.decimals === 0;
    });

    if (nftAccounts.length === 0) {
      return res.status(200).json({ positions: [] });
    }

    // Step 3: Fetch Raydium Pools
    const raydiumPoolsRes = await fetch('https://api.raydium.io/v2/clmm/pools');
    const raydiumPools = await raydiumPoolsRes.json();

    const positions = [];

    for (const nft of nftAccounts) {
      const mint = nft.account.data.parsed.info.mint;

      // Step 4: Fetch position-info for the NFT
      const posRes = await fetch(`https://api.raydium.io/v2/clmm/position-info?mint=${mint}`);
      if (!posRes.ok) continue;

      const positionInfo = await posRes.json();
      const poolId = positionInfo?.poolId;
      const liquidity = positionInfo?.liquidity;
      const tickLower = positionInfo?.tickLowerIndex;
      const tickUpper = positionInfo?.tickUpperIndex;

      if (!poolId || !liquidity || tickLower === undefined || tickUpper === undefined) continue;

      // Step 5: Match poolId to Raydium pool
      const pool = raydiumPools.find(p => p.id === poolId);
      if (!pool) continue;

      // Step 6: Convert liquidity into rough amounts (simple approx for now)
      const amountA = Number(liquidity) / 1e9;
      const amountB = Number(liquidity) / 1e9;

      positions.push({
        tokenA: pool.mintA,     // ✅ Now returns actual SOL, Fartcoin, USDC
        tokenB: pool.mintB,
        lowerPrice: tickIndexToPrice(tickLower, pool.decimalsA, pool.decimalsB),
        upperPrice: tickIndexToPrice(tickUpper, pool.decimalsA, pool.decimalsB),
        amountA,
        amountB
      });
    }

    return res.status(200).json({ positions });
  } catch (error) {
    console.error('Error fetching LP positions:', error);
    return res.status(500).json({ positions: [] });
  }
}

// Helper: Tick index to price conversion
function tickIndexToPrice(tickIndex, decimalsA, decimalsB) {
  const sqrt = Math.pow(1.0001, tickIndex / 2);
  const price = (sqrt * sqrt) * Math.pow(10, decimalsA - decimalsB);
  return price;
}
