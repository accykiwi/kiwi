export default async function handler(req, res) {
  const walletAddress = "2eb81eBXidrgW6sSzTDnHTEQpqJpmkANMCSRS1BKjUku";
  const solanaEndpoint = "https://api.mainnet-beta.solana.com";

  try {
    // Fetch all token accounts for the wallet
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

    // Find NFT LPs (Raydium CLMM NFTs are supply = 1 and special mint addresses)
    const lpNFTs = tokenAccounts.filter(acc => {
      const info = acc?.account?.data?.parsed?.info;
      return info?.tokenAmount?.amount === "1" && info?.tokenAmount?.decimals === 0;
    });

    if (lpNFTs.length === 0) {
      return res.status(200).json({ positions: [] }); // No LP NFTs found
    }

    const positions = [];

    for (const nft of lpNFTs) {
      const mintAddress = nft.account.data.parsed.info.mint;

      // Fetch on-chain metadata account for the NFT
      const metadataPDA = await fetchMetadataPDA(mintAddress);
      if (!metadataPDA) continue;

      const { tokenA, tokenB, lowerPrice, upperPrice, amountA, amountB } = metadataPDA;

      positions.push({
        tokenA,
        tokenB,
        lowerPrice,
        upperPrice,
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

// Helper: Fetch fake metadata for testing
// In real world you decode on-chain accounts, but for now using fake simple match
async function fetchMetadataPDA(mint) {
  // Example hardcoded mapping
  const fakeMetadata = {
    // Your SOL/Fartcoin LP NFT mint address
    "69kdRLyP5DTRkpHraaSZAQbWmAwzF9guKjZfzMXzcbAs": {
      tokenA: "So11111111111111111111111111111111111111112",
      tokenB: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
      lowerPrice: 121.554248,
      upperPrice: 148.569166,
      amountA: 2.31,
      amountB: 1298.12
    },
    // Your SOL/USDC LP NFT mint address
    "DEr6v1q7w4vPRMUSgRwdpsV8Pdvt96KipzpuwpKUr6q3": {
      tokenA: "So11111111111111111111111111111111111111112",
      tokenB: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      lowerPrice: 136.272279,
      upperPrice: 166.558217,
      amountA: 2.08,
      amountB: 441.00
    }
  };

  return fakeMetadata[mint] || null;
}
