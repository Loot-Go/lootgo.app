import ManageCpop from "@/components/manage-cpop";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: { creator_address: string };
}

async function getCpopData(creatorAddress: string | undefined | null) {
  if (!creatorAddress) {
    return [];
  }
  const cpops = await prisma.cpop.findMany({
    where: {
      creator_address: creatorAddress,
    },
    select: {
      id: true,
      eventName: true,
      imageUrl: true,
      tokenAddress: true,
    },
  });
  return cpops;
}

export default async function ViewPage({ params }: PageProps) {
  const creatorAddress = params.creator_address;
  const cpops = await getCpopData(creatorAddress);

  if (!creatorAddress) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <ManageCpop cpops={cpops} />
    </main>
  );
}
