import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Camera, HardDrive, Smartphone } from "lucide-react";

interface DashboardStats {
  totalEvents: number;
  totalPhotos: number;
  storageUsed: string;
  deviceBreakdown: { name: string; value: number; color: string }[];
  uploadTrends: { date: string; uploads: number }[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalPhotos: 0,
    storageUsed: "0 GB",
    deviceBreakdown: [],
    uploadTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin-login");
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch events count
      const { count: eventsCount } = await supabase
        .from('Events')
        .select('*', { count: 'exact' });

      // Get photos from storage
      const { data: photos } = await supabase.storage
        .from('event_photos')
        .list('', { limit: 1000 });

      // Mock data for demo - replace with actual storage calculation
      const mockStats: DashboardStats = {
        totalEvents: eventsCount || 12,
        totalPhotos: photos?.length || 2160,
        storageUsed: "5.3 GB",
        deviceBreakdown: [
          { name: "iOS", value: 65, color: "#3b82f6" },
          { name: "Android", value: 35, color: "#93c5fd" }
        ],
        uploadTrends: [
          { date: "Aug 21", uploads: 45 },
          { date: "Aug 22", uploads: 52 },
          { date: "Aug 23", uploads: 38 },
          { date: "Aug 24", uploads: 125 },
          { date: "Aug 25", uploads: 85 },
          { date: "Aug 26", uploads: 92 },
          { date: "Aug 27", uploads: 210 },
          { date: "Aug 28", uploads: 180 }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Created events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhotos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Photos uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed}</div>
            <p className="text-xs text-muted-foreground">Total storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.uploadTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="uploads" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {stats.deviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {stats.deviceBreakdown.map((entry) => (
                <div key={entry.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}