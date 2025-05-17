import { generateRandomNumber } from "@/lib/random-number";
import { solanaAirdrop } from "@/lib/solana-drop";
import { NextResponse } from "next/server";
import { z } from "zod";

// Input validation schema
const claimTokenSchema = z.object({
  walletAddress: z.string().min(32).max(44), // Solana addresses are 32-44 chars
  tokenMintAddress: z.string().min(32).max(44),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the token against the environment variable
    if (token !== process.env.API_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Validate input
    const result = claimTokenSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }

    const { walletAddress, tokenMintAddress } = result.data;

    const { randomNo } = await generateRandomNumber();

    if (randomNo) {
      const airdrop = await solanaAirdrop({
        recipientAddress: walletAddress,
        tokenMint: tokenMintAddress,
        amount: randomNo,
      });

      return NextResponse.json({
        success: true,
        message: "Token claim request received",
        data: {
          walletAddress,
          tokenMintAddress,
          airdrop,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Token claim request received",
      data: {
        walletAddress,
        tokenMintAddress,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing token claim:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
