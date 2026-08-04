import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Upload, Eye, ImageIcon, Clock } from "lucide-react";

interface EventEditExtrasProps {
  eventId: string;
  onPhotoCountChange?: (count: number) => void;
}

interface PhotoRow {
  id: string;
  photo_url: string;
  thumbnail_url: string | null;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

// Derive the storage object path inside the event_photos bucket from a public URL
const storagePathFromUrl = (url: string) => {
  const marker = "/object/public/event_photos/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
};

export default function EventEditExtras({
  eventId,
  onPhotoCountChange,
}: EventEditExtrasProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [visits, setVisits] = useState(0);
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  // --- Poster ---
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("Events")
      .select("poster_url")
      .eq("event_id", eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setPosterUrl(data?.poster_url ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handlePosterSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingPoster(true);
    try {
      const safeFile = new File([file], `poster_${Date.now()}.jpg`, {
        type: file.type || "image/jpeg",
      });
      const path = `${eventId}_poster_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(path, safeFile, {
          contentType: safeFile.type || "image/jpeg",
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("posters").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("Events")
        .update({ poster_url: publicUrl })
        .eq("event_id", eventId);
      if (updateError) throw updateError;

      setPosterUrl(publicUrl);
      toast.success("Poster updated successfully");
    } catch (err: any) {
      toast.error(`Poster upload failed: ${err?.message || "Unknown error"}`);
    } finally {
      setUploadingPoster(false);
    }
  };

  // --- Photos ---
  const loadPhotos = useCallback(async () => {
    const { data, error } = await supabase
      .from("event_photos")
      .select("id, photo_url, thumbnail_url")
      .eq("event_id", eventId)
      .order("uploaded_at", { ascending: false });
    if (error) {
      console.error("Failed to load event photos:", error);
      setPhotos([]);
    } else {
      setPhotos(data || []);
      onPhotoCountChange?.((data || []).length);
    }
    setPhotosLoading(false);
  }, [eventId, onPhotoCountChange]);

  useEffect(() => {
    setPhotosLoading(true);
    loadPhotos();
  }, [loadPhotos]);

  const deletePhoto = async (photo: PhotoRow) => {
    setDeletingId(photo.id);
    try {
      const paths = [photo.photo_url, photo.thumbnail_url]
        .filter(Boolean)
        .map((u) => storagePathFromUrl(u as string))
        .filter(Boolean) as string[];

      if (paths.length) {
        await supabase.storage.from("event_photos").remove(paths);
      }

      const { error } = await supabase
        .from("event_photos")
        .delete()
        .eq("id", photo.id);
      if (error) throw error;

      setPhotos((prev) => {
        const next = prev.filter((p) => p.id !== photo.id);
        onPhotoCountChange?.(next.length);
        return next;
      });
      toast.success("Photo deleted");
    } catch (err: any) {
      toast.error(`Delete failed: ${err?.message || "Unknown error"}`);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // --- Analytics ---
  const loadAnalytics = useCallback(async () => {
    const { count } = await supabase
      .from("event_visits")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);
    setVisits(count || 0);

    const { data } = await supabase
      .from("event_visits")
      .select("visited_at")
      .eq("event_id", eventId)
      .order("visited_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setLastVisit(data?.visited_at ?? null);
  }, [eventId]);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(() => {
      loadAnalytics();
      loadPhotos();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics, loadPhotos]);

  return (
    <div className="space-y-6">
      {/* Section 2 — Change Poster */}
      <Separator />
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Change Poster</h3>
        <div className="flex items-center gap-4">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt="Current event poster"
              className="w-20 h-20 object-cover rounded-md border"
            />
          ) : (
            <div className="w-20 h-20 rounded-md border flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePosterSelect}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploadingPoster}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadingPoster ? "Uploading..." : "Upload New Poster"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP</p>
          </div>
        </div>
      </div>

      {/* Section 3 — Guest Photos */}
      <Separator />
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Guest Photos ({photos.length})</h3>
        {photosLoading ? (
          <p className="text-sm text-muted-foreground">Loading photos...</p>
        ) : photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-h-[320px] overflow-y-auto">
            {photos.map((p) => (
              <div key={p.id} className="relative group">
                <img
                  src={p.thumbnail_url || p.photo_url}
                  alt="Guest uploaded photo"
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-md border"
                />
                <button
                  type="button"
                  aria-label="Open full size photo"
                  onClick={() =>
                    window.open(p.photo_url, "_blank", "noopener,noreferrer")
                  }
                  className="absolute bottom-1 left-1 p-1 rounded bg-background/80 border"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Delete photo"
                  onClick={() => setConfirmDeleteId(p.id)}
                  className="absolute top-1 right-1 p-1 rounded bg-background/80 border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {confirmDeleteId === p.id && (
                  <div className="absolute inset-0 rounded-md bg-background/95 border flex flex-col items-center justify-center gap-2 p-2 text-center">
                    <p className="text-xs font-medium">Delete this photo permanently?</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={deletingId === p.id}
                        onClick={() => deletePhoto(p)}
                        className="h-7 px-2 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deletingId === p.id ? "..." : "Yes"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === p.id}
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-7 px-2"
                      >
                        No
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4 — Event Analytics */}
      <Separator />
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Event Analytics</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Total visits</p>
            <p className="text-2xl font-bold">{visits}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Photos uploaded</p>
            <p className="text-2xl font-bold">{photos.length}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Last visit</p>
            <p className="text-sm font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              {lastVisit ? `Last visited: ${timeAgo(lastVisit)}` : "No visits yet"}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Refreshes automatically every 30 seconds.</p>
      </div>
    </div>
  );
}
