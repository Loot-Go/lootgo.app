import { prisma } from "@/lib/prisma";
import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { claim } from "../../actions";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const wallet_address = searchParams.get("wallet_address");
  const id = searchParams.get("id");

  if (!wallet_address || !id) {
    return NextResponse.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    );
  }

  const cpop = await prisma.cpop.findFirst({
    where: {
      id,
    },
  });

  if (!cpop) {
    return NextResponse.json({ error: "CPOP not found" }, { status: 404 });
  }

  const mint_address = cpop.tokenId!;

  // const authHeader = request.headers.get("authorization");

  // if (!authHeader) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  // const token = authHeader.split(" ")[1];

  // if (!token) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  // // Verify the token against the environment variable
  // if (token !== process.env.API_TOKEN) {
  //   return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  // }

  const claimStatus = await claim(
    new PublicKey(wallet_address),
    new PublicKey(mint_address)
  );
  return NextResponse.json(claimStatus);
};

export async function POST(request: Request) {
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

  try {
    const body = await request.json();
    const { wallet_address, mint_address } = body;

    if (!wallet_address || !mint_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const claimStatus = await claim(
      new PublicKey(wallet_address),
      new PublicKey(mint_address)
    );

    return NextResponse.json(claimStatus);
  } catch (error) {
    console.error("Error processing claim:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
