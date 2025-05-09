import type { Metadata } from "next"
import CPOPCreatorForm from "@/components/cpop-creator-form"

export const metadata: Metadata = {
  title: "cPOP Creator | ZK Compression",
  description: "Create compressed Proof of Participation tokens for Solana events",
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-2">cPOP Creator</h1>
      <p className="text-center text-muted-foreground mb-8">
        Create compressed Proof of Participation tokens for your Solana events
      </p>
      <CPOPCreatorForm />
    </main>
  )
}
