import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import * as web3 from "@solana/web3.js";
import bs58 from "bs58";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const payer = web3.Keypair.fromSecretKey(
      bs58.decode(process.env.PAYER_KEYPAIR!)
    );

    const connection = "https://api.devnet.solana.com";
    const umi = createUmi(connection)
      .use(mplBubblegum())
      .use(mplTokenMetadata())
      .use(keypairIdentity(fromWeb3JsKeypair(payer)));

    const nftMint = generateSigner(umi);
    console.log("NFT Mint Public Key:", nftMint.publicKey);

    const create = await createNft(umi, {
      mint: nftMint,
      name: name,
      uri: "",
      isCollection: true,
      sellerFeeBasisPoints: percentAmount(5),
    }).sendAndConfirm(umi);

    return NextResponse.json({
      success: true,
      message: "NFT created successfully",
      signature: create.signature,
      mintAddress: nftMint.publicKey,
    });
  } catch (error: any) {
    console.error("Error creating NFT:", error);
    if (error.logs) {
      console.error("Transaction logs:", error.logs);
    }
    return NextResponse.json(
      {
        error: "Failed to create NFT",
        details: error.message,
        logs: error.logs,
      },
      { status: 500 }
    );
  }
}
