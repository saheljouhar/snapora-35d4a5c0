import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface EventRow {
  event_id: string;
  display_name: string | null;
  name: string | null;
  date: string | null;
  status: string | null;
  photoCount: number;
}

const formatDateDMY = (d: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function EventsManagement() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "closed">("active");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
          status: e.status,
          photoCount: count || 0,
        };
      })
    );

    // Sort: most recent date first, nulls at bottom
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
    setEditing(event);
    setEditDisplayName(event.display_name || event.name || "");
    setEditDate(event.date || "");
    setEditStatus(event.status === "closed" ? "closed" : "active");
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditing(null);
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from("Events")
      .update({
        display_name: editDisplayName,
        date: editDate || null,
        status: editStatus,
      })
      .eq("event_id", editing.event_id);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    toast.success("Event updated successfully.");
    setEvents((prev) =>
      prev.map((e) =>
        e.event_id === editing.event_id
          ? {
              ...e,
              display_name: editDisplayName,
              date: editDate || null,
              status: editStatus,
            }
          : e
      )
    );
    closeEdit();
  };

  if (loading) {
    return <div className="p-6">Loading events...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Events</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.event_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
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
                          event.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {event.status === "active" ? "Active" : "Closed"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openEdit(event)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-display-name">Display name</Label>
              <Input
                id="edit-display-name"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Event date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate || ""}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editStatus}
                onValueChange={(v) => setEditStatus(v as "active" | "closed")}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {saveError && (
              <p className="text-red-600 text-sm font-medium">{saveError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
