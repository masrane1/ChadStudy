import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "@/components/admin/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  Users, 
  FileText, 
  Download, 
  Star, 
  MessageSquare, 
  Plus,
  BarChart3,
  BookOpen,
  TrendingUp
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalDocuments: number;
  totalDownloads: number;
  totalComments: number;
  totalRatings: number;
  recentDocuments: {
    id: number;
    title: string;
    subject: string;
    downloads: number;
  }[];
  popularDocuments: {
    id: number;
    title: string;
    subject: string;
    downloads: number;
  }[];
}

export default function AdminDashboard() {
  // In a real app, this would be an actual API endpoint
  // Here, we'll use mock data for demonstration
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      return {
        totalUsers: 125,
        totalDocuments: 348,
        totalDownloads: 2458,
        totalComments: 876,
        totalRatings: 1245,
        recentDocuments: [
          { id: 1, title: "Bac D - Épreuve de Mathématiques", subject: "Mathématiques", downloads: 42 },
          { id: 2, title: "Bac A - Sciences de la Vie et de la Terre", subject: "SVT", downloads: 28 },
          { id: 3, title: "Bac A, C, D - Philosophie", subject: "Philosophie", downloads: 36 }
        ],
        popularDocuments: [
          { id: 1, title: "Bac D - Épreuve de Mathématiques", subject: "Mathématiques", downloads: 42 },
          { id: 3, title: "Bac A, C, D - Philosophie", subject: "Philosophie", downloads: 36 },
          { id: 2, title: "Bac A - Sciences de la Vie et de la Terre", subject: "SVT", downloads: 28 }
        ]
      };
    }
  });
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600">Bienvenue sur le panneau d'administration de Bac-Hub Tchad</p>
          </div>
          
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/admin/documents">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un document
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Utilisateurs</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "..." : stats?.totalUsers}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Documents</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "..." : stats?.totalDocuments}</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Téléchargements</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "..." : stats?.totalDownloads}</h3>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Download className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Commentaires</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "..." : stats?.totalComments}</h3>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Evaluations</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "..." : stats?.totalRatings}</h3>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <Star className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Activity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Derniers documents ajoutés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {stats?.recentDocuments.map((doc) => (
                    <li key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <Link href={`/documents/${doc.id}`} className="block">
                        <p className="font-medium text-gray-900 hover:text-primary-600 truncate">{doc.title}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-500">{doc.subject}</span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {doc.downloads}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Documents les plus populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {stats?.popularDocuments.map((doc) => (
                    <li key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <Link href={`/documents/${doc.id}`} className="block">
                        <p className="font-medium text-gray-900 hover:text-primary-600 truncate">{doc.title}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-500">{doc.subject}</span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {doc.downloads}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Statistiques de téléchargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Graphique des téléchargements (Cette section utilisera Recharts dans une implémentation complète)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
