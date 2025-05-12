import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRpcUrl = () => {
  const rpcUrls = [
    process.env.RPC_CLIENT,
    process.env.RPC_CLIENT_2,
    process.env.RPC_CLIENT_3,
    process.env.RPC_CLIENT_4,
    process.env.RPC_CLIENT_5,
  ].filter((url): url is string => !!url);

  const randomIndex = Math.floor(Math.random() * rpcUrls.length);
  return rpcUrls[randomIndex];
};
