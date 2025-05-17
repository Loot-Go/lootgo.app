import {
  CompressedTokenProgram,
  getTokenPoolInfos,
  selectMinCompressedTokenAccountsForTransfer,
  selectTokenPoolInfosForDecompression,
} from "@lightprotocol/compressed-token";
import { bn, confirmTx, createRpc } from "@lightprotocol/stateless.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";

export const decompressToken = async (
  mintAddress: string,
  amount: string,
  provider: any,
  wallet: any,
  rpc: string
) => {
  try {
    console.log("starting to decompress");

    const connection = createRpc(rpc);
    console.log("wallet.publicKey", wallet.publicKey);
    console.log("connection", connection);
    const pubKey = new PublicKey(wallet.publicKey);
    const balance = await connection.getBalance(pubKey);
    if (balance < 1e6) {
      // less than 0.001 SOL
      const airdropSig = await connection.requestAirdrop(pubKey, 1e7);
      console.log("airdropSig", airdropSig);
      await confirmTx(connection, airdropSig);
    }
    const airdropSig = await connection.requestAirdrop(pubKey, 1e7);
    console.log("airdropSig", airdropSig);

    // const getSol = await confirmTx(connection, airdropSig);
    // console.log("got sol: ", getSol);
    const mint = new PublicKey(mintAddress);
    const ata = await getAssociatedTokenAddress(
      mint,
      pubKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const ataInfo = await connection.getAccountInfo(ata);
    console.log("ata logs:" + ata + ";;;;" + ataInfo);
    if (!ataInfo) {
      const ataIx = createAssociatedTokenAccountInstruction(
        pubKey, // payer
        ata,
        pubKey, // owner
        mint,
        TOKEN_2022_PROGRAM_ID
      );

      const ataTx = new Transaction().add(ataIx);
      ataTx.feePayer = pubKey;
      ataTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const result = await provider.request({
        method: "signAndSendTransaction",
        params: {
          transaction: ataTx, // <-- CORRECT: tx is a Transaction
          connection: connection,
        },
      });
      console.log(result.signature);
      console.log("ATA created:", ata.toBase58());
    }

    const compressedTokenAccounts =
      await connection.getCompressedTokenAccountsByOwner(pubKey, {
        mint,
      });

    console.log(compressedTokenAccounts);
    const _amount = Number(amount) * Math.pow(10, 9);
    // 2. Select
    const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
      compressedTokenAccounts.items,
      bn(_amount)
    );
    console.log(inputAccounts);

    // 3. Fetch validity proof
    const proof = await connection.getValidityProof(
      inputAccounts.map((account) => account.compressedAccount.hash)
    );
    console.log(proof);

    // 4. Fetch & Select tokenPoolInfos
    const tokenPoolInfos = await getTokenPoolInfos(connection, mint);
    const selectedTokenPoolInfos = selectTokenPoolInfosForDecompression(
      tokenPoolInfos,
      _amount
    );
    console.log(tokenPoolInfos);
    console.log(selectedTokenPoolInfos);

    const to = new PublicKey(ata);
    // 5. Build instruction
    const ix = await CompressedTokenProgram.decompress({
      payer: pubKey,
      inputCompressedTokenAccounts: inputAccounts,
      toAddress: to,
      amount: _amount,
      tokenPoolInfos: selectedTokenPoolInfos,
      recentInputStateRootIndices: proof.rootIndices,
      recentValidityProof: proof.compressedProof,
    });
    console.log(ix);

    // 6. Sign, send, and confirm.
    // Example with keypair:
    // const { blockhash } = await connection.getLatestBlockhash();
    // const signedTx = buildAndSignTx(
    //     [ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }), ix],
    //     payer,
    //     blockhash,
    // );

    const computeIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 300_000,
    });

    const tx = new Transaction().add(computeIx, ix);
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = pubKey;

    const { signature } = await provider.request({
      method: "signAndSendTransaction",
      params: {
        transaction: tx, // <-- CORRECT: tx is a Transaction
        connection: connection,
      },
    });
    console.log(signature);
    return signature;
  } catch (error) {
    console.log(error);
  }
};

export default { decompressToken };
