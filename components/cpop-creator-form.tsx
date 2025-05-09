"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ImageUpload from "@/components/image-upload";
import { WalletMultiButton } from "@/components/solana/wallet-multi-button";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { mintCPOP } from "@/lib/solana/mint-cpop";
import { cn } from "@/lib/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const formSchema = z
  .object({
    eventName: z.string().min(2, {
      message: "Event name must be at least 2 characters.",
    }),
    organizerName: z.string().min(2, {
      message: "Organizer name must be at least 2 characters.",
    }),
    image: z.string().url({
      message: "Please upload an image.",
    }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    website: z.string().url({
      message: "Please enter a valid URL.",
    }),
    startDate: z.date({
      required_error: "Please select a start date.",
    }),
    endDate: z
      .date({
        required_error: "Please select an end date.",
      })
      .refine((date) => date > new Date(), {
        message: "End date must be in the future.",
      }),
    amount: z.coerce.number().int().positive({
      message: "Amount must be a positive number.",
    }),
    location: z.string().min(2, {
      message: "Location must be at least 2 characters.",
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });

export default function CPOPCreatorForm() {
  const { connected, publicKey, wallet, connecting } = useWallet();
  const { connection } = useConnection();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add effect to log wallet state changes
  useEffect(() => {
    console.log("Wallet state changed:", {
      connected,
      connecting,
      publicKey: publicKey?.toString(),
      wallet: wallet?.adapter.name,
    });
  }, [connected, connecting, publicKey, wallet]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      organizerName: "",
      image: "",
      description: "",
      website: "",
      amount: 100,
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submission - Wallet state:", {
      connected,
      connecting,
      publicKey: publicKey?.toString(),
      wallet: wallet?.adapter.name,
    });

    // Wait for wallet to finish connecting if it's in the process
    if (connecting) {
      toast({
        title: "Connecting wallet...",
        description: "Please wait while we connect your wallet.",
      });
      return;
    }

    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Solana wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!publicKey) {
      toast({
        title: "No public key",
        description:
          "Unable to get your wallet's public key. Please try reconnecting your wallet.",
        variant: "destructive",
      });
      return;
    }

    if (!wallet) {
      toast({
        title: "No wallet instance",
        description:
          "Unable to access wallet instance. Please try reconnecting your wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      console.log(wallet);

      // Call the mint function with connection and wallet
      const result = await mintCPOP({
        ...values,
        walletPublicKey: publicKey.toString(),
        connection,
        wallet,
      });

      console.log("Mint result:", result);

      toast({
        title: "cPOP created!",
        description: `Successfully created ${values.amount} cPOP tokens for "${values.eventName}"`,
      });

      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Error creating cPOP:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create cPOP tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-end mb-6">
          <WalletMultiButton />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Solana Hackathon 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Solana Foundation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image for your event (max 5MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your event and what participants will receive"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourevent.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount of cPOP</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of tokens to create
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Virtual or physical location"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !connected}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating cPOP...
                </>
              ) : (
                "Create cPOP Tokens"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
