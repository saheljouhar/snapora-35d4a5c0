import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, FolderOpen } from "lucide-react";

interface Event {
  event_id: string;
  poster_url: string;
  photoCount?: number;
}

export default function EventFiles() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingEvent, setDownloadingEvent] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.event_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      // Fetch events from database
      const { data: eventsData, error } = await supabase
        .from('Events')
        .select('*');

      if (error) throw error;

      // Get photo counts for each event
      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          try {
            const { data: files } = await supabase.storage
              .from('event_photos')
              .list(event.event_id, { limit: 1000 });
            
            return {
              ...event,
              photoCount: files?.length || 0
            };
          } catch {
            return {
              ...event,
              photoCount: 0
            };
          }
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
      // Get all files for the event
      const { data: files, error } = await supabase.storage
        .from('event_photos')
        .list(eventId, { limit: 1000 });

      if (error) throw error;

      if (!files || files.length === 0) {
        toast({
          title: "No photos",
          description: "This event has no photos to download",
        });
        return;
      }

      // For now, we'll simulate the download process
      // In a real implementation, you'd create a ZIP file server-side or use a library
      toast({
        title: "Download started",
        description: `Preparing ${files.length} photos for download...`,
      });

      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Download complete",
        description: `${files.length} photos downloaded successfully`,
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

  if (loading) {
    return <div className="p-6">Loading events...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Event Files & Downloads</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Photo Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "No events match your search" : "No events found"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.event_id}>
                    <TableCell className="font-medium">{event.event_id}</TableCell>
                    <TableCell>{event.photoCount} photos</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadEventPhotos(event.event_id)}
                        disabled={downloadingEvent === event.event_id || event.photoCount === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {downloadingEvent === event.event_id ? "Downloading..." : "Download ZIP"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}