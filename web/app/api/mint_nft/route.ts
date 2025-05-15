import {
  mintV2,
  mplBubblegum,
  parseLeafFromMintV2Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, none, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import * as web3 from "@solana/web3.js";
import bs58 from "bs58";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merkleTree, wallet_address, name, uri } = body;

    if (!merkleTree || !wallet_address || !name || !uri) {
      return NextResponse.json(
        { error: "merkleTree, wallet_address, name, and uri are required" },
        { status: 400 }
      );
    }

    const payer = web3.Keypair.fromSecretKey(
      bs58.decode(process.env.PAYER_KEYPAIR!)
    );

    const connection = "https://api.devnet.solana.com";
    const umi = createUmi(connection)
      .use(mplBubblegum())
      .use(mplTokenMetadata())
      .use(keypairIdentity(fromWeb3JsKeypair(payer)));

    const tx1 = await mintV2(umi, {
      merkleTree: publicKey(merkleTree),
      leafOwner: publicKey(wallet_address),
      metadata: {
        name: name,
        uri: uri,
        sellerFeeBasisPoints: 500, // 5% royalty
        creators: [], // no creators array in this case
        collection: none(), // no collection
      },
    }).sendAndConfirm(umi);

    const leaf1 = await parseLeafFromMintV2Transaction(umi, tx1.signature);

    return NextResponse.json({
      success: true,
      message: "NFT minted successfully",
      signature: tx1.signature,
      assetId: leaf1.id,
    });
  } catch (error: any) {
    console.error("Error minting NFT:", error);
    if (error.logs) {
      console.error("Transaction logs:", error.logs);
    }
    return NextResponse.json(
      {
        error: "Failed to mint NFT",
        details: error.message,
        logs: error.logs,
      },
      { status: 500 }
    );
  }
}
