import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface EventQRModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  displayName: string;
}

export default function EventQRModal({ open, onClose, eventId, displayName }: EventQRModalProps) {
  const url = `https://snapora.lovable.app/?event=${eventId}`;

  const handleDownload = () => {
    const svg = document.getElementById(`qr-${eventId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `${eventId}_qr.png`;
      a.href = pngFile;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{displayName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-lg border">
            <QRCodeSVG id={`qr-${eventId}`} value={url} size={220} level="H" />
          </div>
          <p className="text-xs text-muted-foreground break-all text-center">{url}</p>
        </div>
        <DialogFooter className="flex-row justify-end gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
