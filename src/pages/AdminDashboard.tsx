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
  activeEvents: number;
  deviceBreakdown: { name: string; value: number; color: string }[];
  uploadTrends: { date: string; uploads: number }[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalPhotos: 0,
    storageUsed: "0 GB",
    activeEvents: 0,
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
      // Fetch total events count
      const { count: eventsCount } = await supabase
        .from('Events')
        .select('*', { count: 'exact', head: true });

      // Fetch total photos count
      const { count: photosCount } = await supabase
        .from('event_photos')
        .select('*', { count: 'exact', head: true });

      // Fetch all photos for detailed analysis
      const { data: allPhotos } = await supabase
        .from('event_photos')
        .select('uploaded_at, device_info')
        .order('uploaded_at', { ascending: true });

      // Calculate active events (within last 7 days or future)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeEventsCount } = await supabase
        .from('Events')
        .select('*', { count: 'exact', head: true })
        .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

      // Calculate device breakdown
      let iosCount = 0;
      let androidCount = 0;
      
      allPhotos?.forEach(photo => {
        if (photo.device_info) {
          const deviceLower = photo.device_info.toLowerCase();
          if (deviceLower.includes('ios') || deviceLower.includes('iphone') || deviceLower.includes('ipad')) {
            iosCount++;
          } else if (deviceLower.includes('android')) {
            androidCount++;
          }
        }
      });

      const totalDevices = iosCount + androidCount || 1;
      const iosPercentage = Math.round((iosCount / totalDevices) * 100);
      const androidPercentage = Math.round((androidCount / totalDevices) * 100);

      // Calculate upload trends (last 30 days)
      const uploadTrendsMap = new Map<string, number>();
      const today = new Date();
      
      // Initialize last 30 days with 0 uploads
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        uploadTrendsMap.set(dateStr, 0);
      }

      // Count uploads per day
      allPhotos?.forEach(photo => {
        if (photo.uploaded_at) {
          const uploadDate = new Date(photo.uploaded_at);
          const dateStr = uploadDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (uploadTrendsMap.has(dateStr)) {
            uploadTrendsMap.set(dateStr, (uploadTrendsMap.get(dateStr) || 0) + 1);
          }
        }
      });

      const uploadTrends = Array.from(uploadTrendsMap.entries()).map(([date, uploads]) => ({
        date,
        uploads
      }));

      // Calculate storage used (estimate based on photo count)
      const avgPhotoSize = 2.5; // MB average per photo
      const totalStorageMB = (photosCount || 0) * avgPhotoSize;
      const storageGB = (totalStorageMB / 1024).toFixed(1);

      setStats({
        totalEvents: eventsCount || 0,
        totalPhotos: photosCount || 0,
        storageUsed: `${storageGB} GB`,
        activeEvents: activeEventsCount || 0,
        deviceBreakdown: [
          { name: "iOS", value: iosPercentage, color: "#3b82f6" },
          { name: "Android", value: androidPercentage, color: "#93c5fd" }
        ],
        uploadTrends: uploadTrends.slice(-8) // Show last 8 data points for chart
      });
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
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Last 7 days or upcoming</p>
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