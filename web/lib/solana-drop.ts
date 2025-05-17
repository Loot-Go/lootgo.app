import { transfer } from "@lightprotocol/compressed-token";
import { createRpc } from "@lightprotocol/stateless.js";

import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export const solanaAirdrop = async ({
  recipientAddress,
  tokenMint,
  amount,
}: {
  recipientAddress: string;
  tokenMint: string;
  amount: number;
}) => {
  if (
    [
      "AL5XFoQwkPoRcybziPenQWTYi95hq1KGfiZyBCLtsRgj",
      "72GUif1vsb9L7e5iuxboVxSKsD6UXnnD7kjnYv4bXekU",
    ].includes(tokenMint)
  ) {
    try {
      const mint = new PublicKey(tokenMint);
      const to = new PublicKey(recipientAddress);
      const payer = Keypair.fromSecretKey(
        bs58.decode(process.env.PAYER_KEYPAIR!)
      );

      const RPC_ENDPOINT = process.env.RPC_CLIENT!;
      const connection = createRpc(RPC_ENDPOINT);

      const tokenAmount = amount * Math.pow(10, 9);

      const transferCompressedTxId = await transfer(
        connection,
        payer,
        mint,
        tokenAmount,
        payer,
        to
      );

      console.log("transferCompressedTxId", transferCompressedTxId);
      return transferCompressedTxId;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
};
