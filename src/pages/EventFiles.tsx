import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Download, FolderOpen, FileText, Trash2, Search } from "lucide-react";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "newest" | "oldest" | "photos" | "az";

interface Event {
  event_id: string;
  name: string;
  display_name: string;
  poster_url: string;
  date: string;
  status?: string | null;
  photoCount?: number;
}

export default function EventFiles() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingEvent, setDownloadingEvent] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from('Events')
        .select('*')
        .eq('status', 'closed')
        .order('event_id', { ascending: false });

      if (error) throw error;

      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('event_photos')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.event_id);

          return {
            ...event,
            photoCount: count || 0
          };
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadEventPhotos = async (eventId: string) => {
    setDownloadingEvent(eventId);
    try {
      const { data: photos, error } = await supabase
        .from('event_photos')
        .select('photo_url')
        .eq('event_id', eventId);

      if (error) throw error;

      if (!photos || photos.length === 0) {
        toast({
          title: "No photos",
          description: "This event has no photos to download",
        });
        return;
      }

      toast({
        title: "Preparing download",
        description: `Creating ZIP file with ${photos.length} photos...`,
      });

      const zip = new JSZip();

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        try {
          const response = await fetch(photo.photo_url);
          const blob = await response.blob();
          const fileName = `photo_${i + 1}.jpg`;
          zip.file(fileName, blob);
        } catch (err) {
          console.error(`Failed to download photo ${i + 1}:`, err);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });

      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${eventId}_photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download complete",
        description: `${photos.length} photos downloaded successfully`,
      });

    } catch (error) {
      console.error("Error downloading photos:", error);
      toast({
        title: "Error",
        description: "Failed to download photos",
        variant: "destructive",
      });
    } finally {
      setDownloadingEvent(null);
    }
  };

  const generatePDFReport = async (event: Event) => {
    setGeneratingPDF(event.event_id);
    try {
      const { data: photos } = await supabase
        .from('event_photos')
        .select('uploaded_at, device_info')
        .eq('event_id', event.event_id);

      const avgPhotoSize = 2.5;
      const totalStorageMB = (event.photoCount || 0) * avgPhotoSize;

      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Event Report", 20, 20);

      doc.setFontSize(12);
      doc.text(`Event: ${event.display_name || event.name || event.event_id}`, 20, 40);
      doc.text(`Event ID: ${event.event_id}`, 20, 50);
      if (event.date) {
        doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 20, 60);
      }

      doc.setFontSize(14);
      doc.text("Statistics", 20, 80);
      doc.setFontSize(12);
      doc.text(`Total Photos/Videos: ${event.photoCount || 0}`, 20, 95);
      doc.text(`Storage Used: ${totalStorageMB.toFixed(1)} MB`, 20, 105);

      if (photos && photos.length > 0) {
        let iosCount = 0;
        let androidCount = 0;

        photos.forEach(photo => {
          if (photo.device_info) {
            const deviceLower = photo.device_info.toLowerCase();
            if (deviceLower.includes('ios') || deviceLower.includes('iphone')) {
              iosCount++;
            } else if (deviceLower.includes('android')) {
              androidCount++;
            }
          }
        });

        doc.text("Device Breakdown:", 20, 120);
        doc.text(`iOS: ${iosCount} (${Math.round((iosCount / photos.length) * 100)}%)`, 30, 130);
        doc.text(`Android: ${androidCount} (${Math.round((androidCount / photos.length) * 100)}%)`, 30, 140);
      }

      if (photos && photos.length > 0) {
        doc.text("Upload Activity:", 20, 160);
        const sortedPhotos = photos.sort((a, b) =>
          new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
        );
        const firstUpload = sortedPhotos[0]?.uploaded_at;
        const lastUpload = sortedPhotos[sortedPhotos.length - 1]?.uploaded_at;

        if (firstUpload) {
          doc.text(`First Upload: ${new Date(firstUpload).toLocaleString()}`, 30, 170);
        }
        if (lastUpload) {
          doc.text(`Last Upload: ${new Date(lastUpload).toLocaleString()}`, 30, 180);
        }
      }

      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 280);

      doc.save(`${event.event_id}_report.pdf`);

      toast({
        title: "PDF Generated",
        description: "Event report downloaded successfully",
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(null);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { data: photos } = await supabase
        .from('event_photos')
        .select('id')
        .eq('event_id', eventId);

      if (photos && photos.length > 0) {
        const { error: photosError } = await supabase
          .from('event_photos')
          .delete()
          .eq('event_id', eventId);

        if (photosError) throw photosError;
      }

      const { error: eventError } = await supabase
        .from('Events')
        .delete()
        .eq('event_id', eventId);

      if (eventError) throw eventError;

      setEvents(prev => prev.filter(e => e.event_id !== eventId));

      toast({
        title: "Event deleted",
        description: "Event and all associated photos have been deleted",
      });

    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setDeleteEventId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading events...</div>;
  }

  const filteredEvents = events.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (e.display_name || "").toLowerCase().includes(q) ||
      (e.name || "").toLowerCase().includes(q) ||
      (e.event_id || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Event Files — Ready for Download</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Closed Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by event name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead className="w-[260px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {events.length === 0
                        ? "No closed events yet. Close an event from Event Management to make its files available here."
                        : "No events match your search."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.event_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.display_name || event.name || event.event_id}</p>
                        <p className="text-sm text-muted-foreground">{event.event_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.date ? new Date(event.date).toLocaleDateString() : "Date Not Set"}
                    </TableCell>
                    <TableCell>{event.photoCount} photos</TableCell>
                    <TableCell className="w-[260px]">
                      <div className="flex justify-end gap-8">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadEventPhotos(event.event_id)}
                          disabled={downloadingEvent === event.event_id || event.photoCount === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {downloadingEvent === event.event_id ? "Downloading..." : "ZIP"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDFReport(event)}
                          disabled={generatingPDF === event.event_id}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {generatingPDF === event.event_id ? "Generating..." : "PDF"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteEventId(event.event_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{deleteEventId}" and all associated photos.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && deleteEvent(deleteEventId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
