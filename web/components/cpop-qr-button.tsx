"use client";

import { QrCode } from "lucide-react";
import { useCallback, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface CpopQRButtonProps {
  cpopId: string;
  eventName: string;
}

export function CpopQRButton({ cpopId, eventName }: CpopQRButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code for {eventName} attendance</DialogTitle>
        </DialogHeader>
        <div className="grid place-items-center py-4">
          {isOpen && (
            <QRCode
              value={cpopId}
              qrStyle="fluid"
              size={200}
              bgColor="white"
              fgColor="black"
              quietZone={10}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
