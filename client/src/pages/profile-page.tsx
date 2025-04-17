import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Book, Star, User } from "lucide-react";
import { Link } from "wouter";
import StarRating from "@/components/ui/star-rating";
import { Skeleton } from "@/components/ui/skeleton";

interface Document {
  id: number;
  title: string;
  description: string;
  year: number;
  subject: string;
  subjectColor: string;
  fileName: string;
  fileSize: number;
}

interface Favorite {
  id: number;
  documentId: number;
  userId: number;
  createdAt: string;
  document: Document;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("favorites");
  
  const { data: favorites, isLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user
  });
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };
  
  // Get color class based on subject color
  const getSubjectColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "red":
        return "bg-red-100 text-red-800";
      case "green":
        return "bg-green-100 text-green-800";
      case "yellow":
        return "bg-yellow-100 text-yellow-800";
      case "purple":
        return "bg-purple-100 text-purple-800";
      case "orange":
        return "bg-orange-100 text-orange-800";
      case "indigo":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
            <p className="text-gray-600">Gérez votre compte et vos documents favoris</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Profile sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-4">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-4">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
                  </div>
                  <CardTitle className="text-center">{user?.fullName || user?.username}</CardTitle>
                  <CardDescription className="text-center">{user?.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Mon profil
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-primary-600" asChild>
                      <Link href="/profile">
                        <Book className="mr-2 h-4 w-4" />
                        Mes favoris
                      </Link>
                    </Button>
                    {user?.role === "admin" && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/admin">
                          <Star className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="favorites">
                        <Book className="mr-2 h-4 w-4" />
                        Mes documents favoris
                      </TabsTrigger>
                      <TabsTrigger value="account">
                        <User className="mr-2 h-4 w-4" />
                        Informations du compte
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <TabsContent value="favorites" className="mt-0">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border rounded-lg p-4">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/4 mb-4" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : favorites && favorites.length > 0 ? (
                      <div className="space-y-4">
                        {favorites.map((favorite) => (
                          <div key={favorite.id} className="border rounded-lg p-4 hover:border-primary-200 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`${getSubjectColorClass(favorite.document.subjectColor)} text-xs font-medium px-2.5 py-0.5 rounded`}>
                                    {favorite.document.subject}
                                  </span>
                                  <span className="text-gray-500 text-sm">{favorite.document.year}</span>
                                </div>
                                <Link href={`/documents/${favorite.document.id}`}>
                                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                                    {favorite.document.title}
                                  </h3>
                                </Link>
                                <p className="text-gray-600 text-sm mt-1">{formatFileSize(favorite.document.fileSize)}</p>
                              </div>
                              
                              <Button asChild className="w-full md:w-auto">
                                <Link href={`/api/documents/${favorite.document.id}/download`}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Télécharger
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <Book className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun favori</h3>
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore de documents favoris.</p>
                        <Button asChild>
                          <Link href="/">
                            Parcourir les documents
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="account" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                            <div className="p-2 bg-gray-50 rounded border">{user?.fullName}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                            <div className="p-2 bg-gray-50 rounded border">{user?.username}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="p-2 bg-gray-50 rounded border">{user?.email}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                            <div className="p-2 bg-gray-50 rounded border capitalize">{user?.role}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Paramètres du compte</h3>
                        <div className="space-y-4">
                          <Button variant="outline">
                            Changer de mot de passe
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700">
                            Supprimer mon compte
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
