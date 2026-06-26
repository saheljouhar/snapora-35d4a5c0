import { useEffect, useState, Fragment } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { Pencil, XCircle, Trash2, Search, QrCode, ExternalLink } from "lucide-react";
import EventQRModal from "@/components/EventQRModal";

interface EventRow {
  event_id: string;
  display_name: string | null;
  name: string | null;
  date: string | null;
  description: string | null;
  status: string | null;
  photoCount: number;
}

const formatDateDMY = (d: string | null) => {
  if (!d) return "Date not set";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "Date not set";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function EventsManagement() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmCloseEvent, setConfirmCloseEvent] = useState<EventRow | null>(null);
  const [closing, setClosing] = useState(false);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<EventRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [qrEvent, setQrEvent] = useState<EventRow | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("Events").select("*");
    if (error) {
      toast.error(`Failed to load events: ${error.message}`);
      setLoading(false);
      return;
    }

    const withCounts: EventRow[] = await Promise.all(
      (data || []).map(async (e: any) => {
        const { count } = await supabase
          .from("event_photos")
          .select("*", { count: "exact", head: true })
          .eq("event_id", e.event_id);
        return {
          event_id: e.event_id,
          display_name: e.display_name,
          name: e.name,
          date: e.date,
          description: e.description ?? null,
          status: e.status,
          photoCount: count || 0,
        };
      })
    );

    withCounts.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setEvents(withCounts);
    setLoading(false);
  };

  const openEdit = (event: EventRow) => {
    setEditingId(event.event_id);
    setEditDisplayName(event.display_name || event.name || "");
    setEditDate(event.date || "");
    setEditDescription(event.description || "");
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditingId(null);
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from("Events")
      .update({
        display_name: editDisplayName,
        date: editDate || null,
        description: editDescription || null,
      })
      .eq("event_id", editingId);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    toast.success("Event updated.");
    setEvents((prev) =>
      prev.map((e) =>
        e.event_id === editingId
          ? {
              ...e,
              display_name: editDisplayName,
              date: editDate || null,
              description: editDescription || null,
            }
          : e
      )
    );
    closeEdit();
  };

  const handleCloseEvent = async () => {
    if (!confirmCloseEvent) return;
    setClosing(true);
    const { error } = await supabase
      .from("Events")
      .update({ status: "closed" })
      .eq("event_id", confirmCloseEvent.event_id);
    setClosing(false);

    if (error) {
      toast.error(`Failed to close event: ${error.message}`);
      return;
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.event_id === confirmCloseEvent.event_id ? { ...e, status: "closed" } : e
      )
    );
    toast.success("Event closed. Files are now available for download in Event Files.");
    setConfirmCloseEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (!confirmDeleteEvent) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase
      .from("Events")
      .delete()
      .eq("event_id", confirmDeleteEvent.event_id);
    setDeleting(false);

    if (error) {
      setDeleteError(error.message);
      return;
    }

    setEvents((prev) => prev.filter((e) => e.event_id !== confirmDeleteEvent.event_id));
    toast.success("Event deleted successfully.");
    setConfirmDeleteEvent(null);
  };

  const filteredEvents = events.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (e.display_name || "").toLowerCase().includes(q) ||
      (e.name || "").toLowerCase().includes(q) ||
      (e.event_id || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="p-6">Loading events...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Event Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Events ({filteredEvents.length})</CardTitle>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => {
                  const isClosed = event.status === "closed";
                  const isEditing = editingId === event.event_id;
                  return (
                    <Fragment key={event.event_id}>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="font-bold">
                              {event.display_name || event.name || event.event_id}
                            </p>
                            <p className="text-sm text-muted-foreground">{event.event_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDateDMY(event.date)}</TableCell>
                        <TableCell>{event.photoCount}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              !isClosed
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {!isClosed ? "Active" : "Closed"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => (isEditing ? closeEdit() : openEdit(event))}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              {isEditing ? "Close" : "Edit"}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setQrEvent(event)}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `https://snapora.lovable.app/?event=${event.event_id}`,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            {isClosed ? (
                              <>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-200 text-gray-500 cursor-not-allowed">
                                  Event Closed
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDeleteError(null);
                                    setConfirmDeleteEvent(event);
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => setConfirmCloseEvent(event)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Close Event
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {isEditing && (
                        <TableRow className="bg-muted/40">
                          <TableCell colSpan={5}>
                            <div className="p-4 space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`name-${event.event_id}`}>Display name</Label>
                                  <Input
                                    id={`name-${event.event_id}`}
                                    value={editDisplayName}
                                    onChange={(e) => setEditDisplayName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`date-${event.event_id}`}>Event date</Label>
                                  <Input
                                    id={`date-${event.event_id}`}
                                    type="date"
                                    value={editDate || ""}
                                    onChange={(e) => setEditDate(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`desc-${event.event_id}`}>Description</Label>
                                <Textarea
                                  id={`desc-${event.event_id}`}
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                />
                              </div>
                              {saveError && (
                                <p className="text-red-600 text-sm font-medium">{saveError}</p>
                              )}
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={closeEdit} disabled={saving}>
                                  Cancel
                                </Button>
                                <Button onClick={saveEdit} disabled={saving}>
                                  {saving ? "Saving..." : "Save Changes"}
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!confirmCloseEvent}
        onOpenChange={(o) => !o && !closing && setConfirmCloseEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close{" "}
              <span className="font-semibold">
                {confirmCloseEvent?.display_name ||
                  confirmCloseEvent?.name ||
                  confirmCloseEvent?.event_id}
              </span>
              ? Guests will no longer be able to upload photos. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseEvent}
              disabled={closing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {closing ? "Closing..." : "Yes, Close Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmDeleteEvent}
        onOpenChange={(o) => !o && !deleting && setConfirmDeleteEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">
                {confirmDeleteEvent?.display_name ||
                  confirmDeleteEvent?.name ||
                  confirmDeleteEvent?.event_id}
              </span>
              ? This will delete the event record. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-red-600 text-sm font-medium">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
