import { mintCPOPToken } from "@/lib/cpop-mint";
import { Metaplex } from "@metaplex-foundation/js";
import { Wallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

interface MintCPOPParams {
  eventName: string;
  organizerName: string;
  image: string;
  description: string;
  website: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  location: string;
  walletPublicKey: string;
  connection: Connection;
  wallet: Wallet;
}

interface MintCPOPResult {
  nftAddress: string;
  uri: string;
  tokenMintAddress: string;
  poolTxId: string;
  ataAddress: string;
  mintToTxId: string;
}

export async function mintCPOP(
  params: MintCPOPParams
): Promise<MintCPOPResult> {
  try {
    if (!params.wallet.adapter) {
      throw new Error("Wallet adapter not found");
    }

    if (!params.wallet.adapter.publicKey) {
      throw new Error("Wallet public key not found");
    }

    // Initialize Metaplex
    const metaplex = new Metaplex(params.connection);

    // First mint the CPOP token
    const mintResult = await mintCPOPToken(
      params.connection as any,
      params.wallet as any
    );

    // Create NFT metadata
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: params.eventName,
      symbol: "cPOP",
      description: params.description,
      image: params.image,
      attributes: [
        { trait_type: "Organizer", value: params.organizerName },
        { trait_type: "Website", value: params.website },
        { trait_type: "Start Date", value: params.startDate.toISOString() },
        { trait_type: "End Date", value: params.endDate.toISOString() },
        { trait_type: "Location", value: params.location },
      ],
    });

    // Create the NFT
    const { nft } = await metaplex.nfts().create({
      uri,
      name: params.eventName,
      symbol: "cPOP",
      sellerFeeBasisPoints: 0, // No royalties
      isCollection: false,
      updateAuthority: metaplex.identity(),
      mintAuthority: metaplex.identity(),
      tokenStandard: 0, // NonFungible
      tokenOwner: params.wallet.adapter.publicKey,
    });

    return {
      nftAddress: nft.address.toBase58(),
      uri,
      tokenMintAddress: mintResult.mintAddress,
      poolTxId: mintResult.poolTxId,
      ataAddress: mintResult.ataAddress,
      mintToTxId: mintResult.mintToTxId,
    };
  } catch (error) {
    console.error("Error minting cPOP:", error);
    throw error;
  }
}
