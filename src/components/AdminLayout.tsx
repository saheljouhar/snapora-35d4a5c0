import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, BarChart3, Plus, FolderOpen, Users } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin-login");
  };

  const navigationItems = [
    { path: "/admin", label: "Dashboard", icon: BarChart3 },
    { path: "/admin/events/create", label: "Create Event", icon: Plus },
    { path: "/admin/events/files", label: "Event Files", icon: FolderOpen },
    { path: "/admin/bookings", label: "Bookings", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-card min-h-[calc(100vh-73px)]">
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}