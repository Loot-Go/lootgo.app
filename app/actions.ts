"use server";

import { prisma } from "@/lib/prisma";
import {
  compress,
  createTokenPool,
  transfer,
} from "@lightprotocol/compressed-token";
import { confirmTx, createRpc } from "@lightprotocol/stateless.js";
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  getOrCreateAssociatedTokenAccount,
  LENGTH_SIZE,
  mintTo as mintToSpl,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const createToken = async ({
  name,
  symbol,
  uri,
  additionalMetadata,
  eventName,
  organizerName,
  description,
  website,
  startDate,
  endDate,
  amount,
  location,
  imageUrl,
}: {
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: [string, string][];
  eventName: string;
  organizerName: string;
  description: string;
  website: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  location: string;
  imageUrl?: string;
}) => {
  const logs = [];

  const payer = Keypair.fromSecretKey(bs58.decode(process.env.PAYER_KEYPAIR!));
  const RPC_ENDPOINT = process.env.RPC_CLIENT!;
  const connection = createRpc(RPC_ENDPOINT);
  // @ jijin mint address (token address) -- save in backend for airdrops
  const mint = Keypair.generate();
  const decimals = 9;
  // @jijin enter the name of the token
  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name,
    symbol,
    uri,
    additionalMetadata,
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  // @jijin this is just to get devnet tokens to make txs
  // airdrop to pay gas
  await confirmTx(
    connection,
    await connection.requestAirdrop(payer.publicKey, 1e7)
  );

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    })
  );
  const txId = await sendAndConfirmTransaction(connection, mintTransaction, [
    payer,
    mint,
  ]);

  console.log(`txId: ${txId}`);

  logs.push({
    type: "Tx id:",
    txId: txId,
    tx: `https://explorer.solana.com/tx/${txId}?cluster=devnet`,
  });

  // register the mint with the Compressed-Token program
  const txId2 = await createTokenPool(
    connection,
    payer,
    mint.publicKey,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log(`register-mint success! txId: ${txId2}`);

  logs.push({
    type: "Register mint:",
    txId: txId2,
    tx: `https://explorer.solana.com/tx/${txId2}?cluster=devnet`,
  });

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint.publicKey,
    payer.publicKey,
    undefined,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  console.log(`ATA: ${ata.address}`);

  logs.push({
    type: "ATA:",
    txId: ata.address.toString(),
    tx: `https://explorer.solana.com/address/${ata.address}?cluster=devnet`,
  });

  // Mint SPL
  const mintTxId = await mintToSpl(
    connection,
    payer,
    mint.publicKey,
    ata.address,
    payer.publicKey,
    // @jijin enter total number of tokens to mint multiplied by 10^decimals
    1e5,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log(`mint-spl success! txId: ${mintTxId}`);

  logs.push({
    type: "Mint SPL:",
    txId: mintTxId,
    tx: `https://explorer.solana.com/tx/${mintTxId}?cluster=devnet`,
  });

  const compressedTokenTxId = await compress(
    connection,
    payer,
    mint.publicKey,
    // @jijin enter total number of tokens to mint multiplied by 10^decimals
    1e5,
    payer,
    ata.address,
    payer.publicKey
  );
  console.log(`compressed-token success! txId: ${compressedTokenTxId}`);

  logs.push({
    type: "Compressed token:",
    txId: compressedTokenTxId,
    tx: `https://explorer.solana.com/tx/${compressedTokenTxId}?cluster=devnet`,
  });

  // Store the event details in the database
  const cpop = await prisma.cPOP.create({
    data: {
      eventName,
      organizerName,
      description,
      website,
      startDate,
      endDate,
      amount,
      location,
      imageUrl,
      tokenAddress: mint.publicKey.toString(),
      tokenId: mint.publicKey.toString(),
      tokenType: "compressed",
      tokenURI: uri,
      // tokenMetadata: metadata,
    },
  });

  return logs;
};

export const claim = async (
  wallet_address: PublicKey,
  mint_address: PublicKey
) => {
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.NEXT_PUBLIC_PAYER_KEYPAIR!)
  );

  const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_CLIENT!;
  const connection = createRpc(RPC_ENDPOINT);
  // @jijin enter the mint address saved while creation here
  // @jijin to address of recipient
  const to = new PublicKey(wallet_address);
  const mint = new PublicKey(mint_address);
  const transferCompressedTxId = await transfer(
    connection,
    payer,
    mint,
    1e5,
    payer,
    to
  );
  console.log(`transfer-compressed success! txId: ${transferCompressedTxId}`);
  // @jijin enter the address of recipient to check balance

  // const publicKey = new PublicKey(
  //   "9ynAU3rnmsocfstoDPaDxx9wVxf7kHEXzNbU4L55UcZ3"
  // );
  // const balances = await connection.getCompressedTokenBalancesByOwnerV2(
  //   publicKey
  // );
};

export default createToken;
