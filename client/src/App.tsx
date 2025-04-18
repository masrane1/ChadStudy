import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DocumentDetail from "@/pages/document-detail";
import ProfilePage from "@/pages/profile-page";
import AdminDashboard from "@/pages/admin/dashboard";
import DocumentManagement from "@/pages/admin/document-management";
import UserManagement from "@/pages/admin/user-management";
import AnnouncementManagement from "@/pages/admin/announcement-management";
import SettingsManagement from "@/pages/admin/settings-management";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/documents/:id" component={DocumentDetail} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/documents" component={DocumentManagement} />
      <ProtectedRoute path="/admin/users" component={UserManagement} />
      <ProtectedRoute path="/admin/announcements" component={AnnouncementManagement} />
      <ProtectedRoute path="/admin/settings" component={SettingsManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
