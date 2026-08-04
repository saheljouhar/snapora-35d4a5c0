import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import EventEditExtras from "@/components/EventEditExtras";

export default function EventEdit() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!eventId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("Events")
        .select("*")
        .eq("event_id", eventId)
        .maybeSingle();

      if (error) {
        toast.error(`Failed to load event: ${error.message}`);
        setLoading(false);
        return;
      }
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setDisplayName((data as any).display_name || (data as any).name || "");
      setDate((data as any).date || "");
      setDescription((data as any).description || "");
      setLoading(false);
    };
    load();
  }, [eventId]);

  const goBack = () => navigate("/admin/events");

  const saveEdit = async () => {
    if (!eventId) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from("Events")
      .update({
        display_name: displayName,
        date: date || null,
        description: description || null,
      })
      .eq("event_id", eventId);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    toast.success("Event updated.");
  };

  if (loading) {
    return <div className="p-6">Loading event...</div>;
  }

  if (notFound) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={goBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event Management
        </Button>
        <p className="text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={goBack} className="-ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Event Management
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-sm text-muted-foreground">{eventId}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Display name</Label>
              <Input
                id="edit-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Event date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {saveError && <p className="text-red-600 text-sm font-medium">{saveError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={goBack} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {eventId && <EventEditExtras eventId={eventId} />}
    </div>
  );
}
