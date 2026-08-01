import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EventPhotosModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  displayName: string;
}

interface PhotoRow {
  id: string;
  photo_url: string;
  thumbnail_url: string | null;
}

export default function EventPhotosModal({
  open,
  onClose,
  eventId,
  displayName,
}: EventPhotosModalProps) {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("event_photos")
        .select("id, photo_url, thumbnail_url")
        .eq("event_id", eventId)
        .order("uploaded_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("Failed to load event photos:", error);
        setPhotos([]);
      } else {
        setPhotos(data || []);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, eventId]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {displayName} — Photos ({photos.length})
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading photos...</p>
        ) : photos.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No photos uploaded yet</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
            {photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => window.open(p.photo_url, "_blank", "noopener,noreferrer")}
                className="aspect-square overflow-hidden rounded-md border"
              >
                <img
                  src={p.thumbnail_url || p.photo_url}
                  alt={`${displayName} guest photo`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
