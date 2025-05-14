import { prisma } from "@/lib/prisma";
import type { Cpop, CpopClaim } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get wallet address from query parameters
    const walletAddress = request.nextUrl.searchParams.get("wallet_address");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find all claims for the given wallet address
    const claims = await prisma.cpopClaim.findMany({
      where: {
        walletAddress: walletAddress,
      },
      include: {
        cpop: true, // Include the associated CPOP data
      },
    });

    if (!claims || claims.length === 0) {
      return NextResponse.json(
        { message: "No POAP tokens found for this wallet" },
        { status: 404 }
      );
    }

    // Transform the data to return only necessary information
    const poapTokens = claims.map((claim: CpopClaim & { cpop: Cpop }) => ({
      image: claim.cpop.imageUrl,
    }));

    return NextResponse.json({
      data: poapTokens,
    });
  } catch (error) {
    console.error("Error fetching POAP tokens:", error);
    return NextResponse.json({
      data: [],
    });
  }
}
