export default async function handler(req, res) {
  const walletAddress = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";
  const solanaEndpoint = "https://api.mainnet-beta.solana.com";

  try {
    // Fetch all token accounts owned by your wallet
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

    // Filter NFT tokens (supply = 1, decimals = 0)
    const nftAccounts = tokenAccounts.filter(acc => {
      const info = acc?.account?.data?.parsed?.info;
      return info?.tokenAmount?.amount === "1" && info?.tokenAmount?.decimals === 0;
    });

    if (nftAccounts.length === 0) {
      return res.status(200).json({ positions: [] }); // No LP NFTs found
    }

    const raydiumPools = await fetchRaydiumPools();
    if (!raydiumPools.length) {
      return res.status(500).json({ positions: [] });
    }

    const positions = [];

    for (const nft of nftAccounts) {
      const mint = nft.account.data.parsed.info.mint;
      const positionData = await fetchPositionData(mint);

      if (!positionData) continue;

      const poolInfo = raydiumPools.find(pool => pool.id === positionData.poolId);
      if (!poolInfo) continue;

      // Calculate amounts from liquidity
      const sqrtPriceX64 = BigInt(poolInfo.sqrtPriceX64);
      const liquidity = BigInt(positionData.liquidity);
      const amountA = Number(liquidity) / 1e9; // Approximation for now
      const amountB = Number(liquidity) / 1e9; // Approximation for now

      positions.push({
        tokenA: poolInfo.mintA,
        tokenB: poolInfo.mintB,
        lowerPrice: tickIndexToPrice(positionData.tickLowerIndex, poolInfo.decimalsA, poolInfo.decimalsB),
        upperPrice: tickIndexToPrice(positionData.tickUpperIndex, poolInfo.decimalsA, poolInfo.decimalsB),
        amountA,
        amountB
      });
    }

    return res.status(200).json({ positions });
  } catch (error) {
    console.error('Error fetching live LP positions:', error);
    return res.status(500).json({ positions: [] });
  }
}

// Helper to fetch Raydium CLMM Pools
async function fetchRaydiumPools() {
  try {
    const res = await fetch('https://api.raydium.io/v2/clmm/pools');
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error('Failed to fetch Raydium pools:', err);
    return [];
  }
}

// Helper to fetch a single position NFT metadata
async function fetchPositionData(mint) {
  try {
    const url = `https://api.raydium.io/v2/clmm/position-info?mint=${mint}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch position data:', err);
    return null;
  }
}

// Helper to convert tick index to price
function tickIndexToPrice(tickIndex, decimalsA, decimalsB) {
  const sqrt = Math.pow(1.0001, tickIndex / 2);
  const price = (sqrt * sqrt) * Math.pow(10, decimalsA - decimalsB);
  return price;
}
