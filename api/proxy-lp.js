export default async function handler(req, res) {
  const walletAddress = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";
  const solanaEndpoint = "https://api.mainnet-beta.solana.com";

  try {
    // 1. Fetch all token accounts for the wallet
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

    // 2. Identify NFT LPs (Raydium CLMM NFTs are supply=1 and decimals=0)
    const nftAccounts = tokenAccounts.filter(acc => {
      const info = acc?.account?.data?.parsed?.info;
      return info?.tokenAmount?.amount === "1" && info?.tokenAmount?.decimals === 0;
    });

    if (nftAccounts.length === 0) {
      return res.status(200).json({ positions: [] });
    }

    // 3. Fetch Raydium pools
    const raydiumPools = await fetchRaydiumPools();
    if (!raydiumPools.length) {
      return res.status(500).json({ positions: [] });
    }

    const positions = [];

    // 4. For each LP NFT, fetch position info
    for (const nft of nftAccounts) {
      const mint = nft.account.data.parsed.info.mint;
      const positionData = await fetchPositionData(mint);

      if (!positionData) continue;

      const poolInfo = raydiumPools.find(pool => pool.id === positionData.poolId);
      if (!poolInfo) continue;

      const amountA = Number(positionData.liquidity) / 1e9; // Simplified approximation
      const amountB = Number(positionData.liquidity) / 1e9; // Simplified approximation

      positions.push({
        tokenA: poolInfo.mintA,    // ✅ CORRECT: Return real underlying asset mint (SOL, Fartcoin, USDC)
        tokenB: poolInfo.mintB,    // ✅ CORRECT
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

// Helper: Fetch Raydium Pools
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

// Helper: Fetch Position Info
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

// Helper: Convert tick index to price
function tickIndexToPrice(tickIndex, decimalsA, decimalsB) {
  const sqrt = Math.pow(1.0001, tickIndex / 2);
  const price = (sqrt * sqrt) * Math.pow(10, decimalsA - decimalsB);
  return price;
}
