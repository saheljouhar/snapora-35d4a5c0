import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Download, Plus, ChevronRight, ChevronLeft, Upload, Copy, ExternalLink } from "lucide-react";

const PUBLIC_BASE_URL = "https://snapora.lovable.app";

type Step = 1 | 2 | 3;

export default function EventCreation() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [eventName, setEventName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{
    id: string;
    uploadUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateEventId = () => {
    const baseId = eventName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit suffix for uniqueness
    return baseId ? `${baseId}_${randomSuffix}` : `event_${randomSuffix}`;
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const fileType = (file.type || '').toLowerCase();
    const rawName = file.name || '';
    const extMatch = rawName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    const hasValidExt = allowedExts.includes(ext);
    const hasValidType = allowedTypes.includes(fileType);

    if (!hasValidType && !hasValidExt) {
      toast({
        title: "Unsupported file",
        description: "Only JPG, JPEG, PNG, or WEBP photos are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Always wrap in a safe File so mobile camera blobs (no name/type) upload correctly.
    // Desktop selections with valid name/type pass through unchanged.
    const safeFile = new File(
      [file],
      rawName && rawName !== 'blob' && rawName.includes('.')
        ? rawName
        : `poster_${Date.now()}.jpg`,
      { type: file.type || 'image/jpeg' }
    );

    setPosterFile(safeFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPosterPreview(reader.result as string);
    };
    reader.readAsDataURL(safeFile);
  };


  // Compress poster image to JPEG (max 1200px on longest side, quality 0.75)
  const compressPoster = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
          } else {
            if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
            'image/jpeg',
            0.75
          );
        };
        img.onerror = () => reject(new Error('Could not read image'));
        img.src = ev.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });

  const handleStep1Next = () => {
    if (!eventName.trim() || !displayName.trim()) {
      toast({
        title: "Required fields",
        description: "Please fill in event name and display name",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    if (!posterFile) {
      toast({
        title: "Poster required",
        description: "Please upload an event poster",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(3);
  };

  const createEvent = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated and session is valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Authentication required",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        setLoading(false);
        window.location.href = '/admin-login';
        return;
      }

      // Refresh the session to ensure it's valid
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Session refresh error:", refreshError);
        toast({
          title: "Session error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setLoading(false);
        window.location.href = '/admin-login';
        return;
      }

      const eventId = generateEventId();
      
      // Compress + upload poster to storage as posters/{eventId}_poster.jpg
      let posterUrl = "";
      if (posterFile) {
        let posterBlob: Blob;
        try {
          posterBlob = await compressPoster(posterFile);
        } catch (err: any) {
          throw new Error(`Could not prepare poster: ${err.message || 'compression failed'}`);
        }

        const fileName = `${eventId}_poster.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('posters')
          .upload(fileName, posterBlob, {
            upsert: true,
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw new Error(`Poster upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('posters')
          .getPublicUrl(fileName);
        posterUrl = urlData.publicUrl;
      }

      // Insert event into database
      const { error: dbError } = await supabase
        .from('Events')
        .insert({
          event_id: eventId,
          name: eventName,
          display_name: displayName,
          date: eventDate || null,
          description: description || null,
          poster_url: posterUrl,
          status: 'active'
        });

      if (dbError) {
        console.error("Database insert error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      const uploadUrl = `${PUBLIC_BASE_URL}/?event=${eventId}`;

      setCreatedEvent({
        id: eventId,
        uploadUrl
      });

      toast({
        title: "Event created!",
        description: "Event created! Your QR code is ready.",
      });

    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please check console for details.",
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

  const handleCopyLink = async () => {
    if (!createdEvent) return;
    try {
      await navigator.clipboard.writeText(createdEvent.uploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handlePreviewEvent = () => {
    if (!createdEvent) return;
    window.open(createdEvent.uploadUrl, "_blank", "noopener,noreferrer");
  };

  const resetForm = () => {
    setCurrentStep(1);
    setEventName("");
    setDisplayName("");
    setEventDate("");
    setDescription("");
    setPosterFile(null);
    setPosterPreview("");
    setCreatedEvent(null);
    setCopied(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            1
          </div>
          <span className="ml-2 hidden sm:inline">Event Details</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            2
          </div>
          <span className="ml-2 hidden sm:inline">Poster Upload</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            3
          </div>
          <span className="ml-2 hidden sm:inline">Finalize</span>
        </div>
      </div>

      {/* Step 1: Event Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name (ID) *</Label>
              <Input
                id="eventName"
                placeholder="e.g., wedding_priya"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">This will be used in the URL</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="e.g., Priya & Aditya's Wedding"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleStep1Next} className="w-full">
              Next: Upload Poster
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Poster Upload */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Upload Event Poster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poster">Event Poster *</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {posterPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={posterPreview} 
                      alt="Poster preview" 
                      className="max-h-64 mx-auto rounded"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview("");
                      }}
                    >
                      Change Poster
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="poster" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                    <input
                      id="poster"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePosterChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleStep2Next} className="flex-1">
                Next: Finalize
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Finalize & Generate */}
      {currentStep === 3 && !createdEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Review & Create</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Event Name:</p>
                <p className="text-muted-foreground">{eventName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Display Name:</p>
                <p className="text-muted-foreground">{displayName}</p>
              </div>
              {eventDate && (
                <div>
                  <p className="text-sm font-medium">Date:</p>
                  <p className="text-muted-foreground">{new Date(eventDate).toLocaleDateString()}</p>
                </div>
              )}
              {description && (
                <div>
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Poster:</p>
                {posterPreview && (
                  <img src={posterPreview} alt="Poster" className="max-h-32 mt-2 rounded" />
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={createEvent} disabled={loading} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success: Event Created */}
      {createdEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Event Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="font-semibold text-lg mb-2">Event ID: {createdEvent.id}</p>
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

              <div className="flex gap-4 justify-center mb-4">
                <Button onClick={downloadQRCode} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded text-sm">
              <p><strong>Public URL:</strong></p>
              <p className="break-all">{createdEvent.uploadUrl}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handlePreviewEvent} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Event Page
              </Button>
              <Button onClick={handleCopyLink} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Link copied!" : "Copy Link"}
              </Button>
            </div>

            <Button onClick={resetForm} className="w-full">
              Create Another Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
