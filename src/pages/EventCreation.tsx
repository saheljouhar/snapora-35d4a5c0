import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Download, Plus } from "lucide-react";

export default function EventCreation() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{
    id: string;
    uploadUrl: string;
  } | null>(null);
  const { toast } = useToast();

  const generateEventId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `EVT_${timestamp}`;
  };

  const createEvent = async () => {
    if (!eventName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const eventId = generateEventId();
      
      // Insert event into database
      const { error: dbError } = await supabase
        .from('Events')
        .insert({
          event_id: eventId,
          poster_url: `https://dydzqautscblrrcvlreh.supabase.co/storage/v1/object/public/posters/${eventId}_poster.jpg`
        });

      if (dbError) throw dbError;

      // Create storage folder (this will be created automatically when first photo is uploaded)
      const uploadUrl = `${window.location.origin}/?event=${eventId}`;
      
      setCreatedEvent({
        id: eventId,
        uploadUrl
      });

      toast({
        title: "Success",
        description: `Event ${eventId} created successfully!`,
      });

      // Reset form
      setEventName("");
      setEventDate("");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!createdEvent) return;

    const svg = document.getElementById("qr-code");
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
      const downloadLink = document.createElement("a");
      downloadLink.download = `${createdEvent.id}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Event Creation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                placeholder="Wedding, Birthday, Concert..."
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date (Optional)</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <Button
              onClick={createEvent}
              disabled={loading}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </CardContent>
        </Card>

        {createdEvent && (
          <Card>
            <CardHeader>
              <CardTitle>Event Created Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="font-semibold text-lg">Event ID: {createdEvent.id}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Share this QR code with guests to upload photos
                </p>
                
                <div className="flex justify-center mb-4">
                  <QRCodeSVG
                    id="qr-code"
                    value={createdEvent.uploadUrl}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </div>

                <Button onClick={downloadQRCode} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
              
              <div className="bg-muted p-3 rounded text-sm">
                <p><strong>Upload URL:</strong></p>
                <p className="break-all">{createdEvent.uploadUrl}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}