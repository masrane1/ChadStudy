import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  Megaphone,
  LogOut,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const menuItems = [
    {
      title: "Tableau de bord",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
      active: location === "/admin",
    },
    {
      title: "Gestion des documents",
      icon: <FileText className="h-5 w-5" />,
      href: "/admin/documents",
      active: location === "/admin/documents",
    },
    {
      title: "Gestion des utilisateurs",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/users",
      active: location === "/admin/users",
    },
    {
      title: "Gestion des annonces",
      icon: <Megaphone className="h-5 w-5" />,
      href: "/admin/announcements",
      active: location === "/admin/announcements",
    },
    {
      title: "Paramètres du site",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
      active: location === "/admin/settings",
    },
  ];
  
  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-primary-600 text-xl font-bold">Bac-Hub</span>
            <span className="ml-1 text-green-500 text-sm font-medium">Admin</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle Menu"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center mt-6 mb-6 pb-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
            <p className="text-xs font-medium text-gray-500">Administrateur</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={item.active ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                item.active ? "bg-primary-50 text-primary-600" : ""
              }`}
              asChild
            >
              <Link href={item.href}>
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="p-6 mt-auto border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Déconnexion</span>
        </Button>
      </div>
    </aside>
  );
}
