import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StarRating from "@/components/ui/star-rating";
import DocumentComments from "@/components/document-comments";
import FavoriteButton from "@/components/favorite-button";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentDetail {
  id: number;
  title: string;
  description: string;
  year: number;
  subject: string;
  subjectColor: string;
  fileName: string;
  fileSize: number;
  averageRating: number;
  ratingCount: number;
  commentCount: number;
  isFavorite: boolean;
  userRating: number;
  downloads: number;
  createdAt: string;
  uploadedBy: number;
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const documentId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for rating
  const [rating, setRating] = useState(0);
  
  // Fetch document details
  const { data: document, isLoading, error } = useQuery<DocumentDetail>({
    queryKey: [`/api/documents/${documentId}`],
  });
  
  // Set initial rating from document data
  useEffect(() => {
    if (document) {
      setRating(document.userRating);
    }
  }, [document]);
  
  // Rate document mutation
  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", `/api/documents/${documentId}/ratings`, { rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      toast({
        title: "Notation enregistrée",
        description: "Merci d'avoir noté ce document !",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la notation",
        variant: "destructive",
      });
    },
  });
  
  // Download document mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", `/api/documents/${documentId}/download`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Téléchargement commencé",
        description: `Le fichier ${data.document.fileName} sera téléchargé sous peu.`,
      });
      
      // In a real app, this would trigger the actual download
      // For now, we'll just update the UI
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de téléchargement",
        description: error.message || "Une erreur est survenue lors du téléchargement",
        variant: "destructive",
      });
    },
  });
  
  const handleRating = (value: number) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez vous connecter pour noter ce document",
        variant: "destructive",
      });
      return;
    }
    
    setRating(value);
    rateMutation.mutate(value);
  };
  
  const handleDownload = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez vous connecter pour télécharger ce document",
        variant: "destructive",
      });
      return;
    }
    
    downloadMutation.mutate();
  };
  
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
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux documents
          </Link>
          
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-5 w-1/4 mb-8" />
              <Skeleton className="h-32 w-full mb-6" />
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 w-full sm:w-40" />
                <Skeleton className="h-10 w-full sm:w-40" />
              </div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Document non trouvé</h3>
                  <p className="text-gray-600 mb-6">Le document que vous recherchez n'existe pas ou a été supprimé.</p>
                  <Button asChild>
                    <Link href="/">
                      Retour à l'accueil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : document && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`${getSubjectColorClass(document.subjectColor)} text-xs font-medium px-2.5 py-0.5 rounded`}>
                    {document.subject}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {document.year}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{document.title}</h1>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center">
                    <StarRating 
                      value={document.averageRating} 
                      count={document.ratingCount} 
                      readonly 
                    />
                  </div>
                  <div className="text-gray-600 text-sm flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {formatFileSize(document.fileSize)}
                  </div>
                  <div className="text-gray-600 text-sm flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {document.downloads} téléchargements
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 whitespace-pre-wrap">{document.description}</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button 
                    onClick={handleDownload} 
                    disabled={downloadMutation.isPending || !user}
                    className="w-full sm:w-auto"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {downloadMutation.isPending 
                      ? "Téléchargement..." 
                      : user 
                        ? "Télécharger le document" 
                        : "Connectez-vous pour télécharger"
                    }
                  </Button>
                  
                  {user && (
                    <FavoriteButton 
                      documentId={document.id} 
                      isFavorite={document.isFavorite} 
                    />
                  )}
                </div>
              </div>
              
              {/* Rating section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Noter ce document</h2>
                
                {user ? (
                  <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4">
                    <span className="text-gray-700">Votre évaluation :</span>
                    <StarRating 
                      value={rating} 
                      onChange={handleRating} 
                      size="lg" 
                      readonly={rateMutation.isPending} 
                    />
                    {rateMutation.isPending && (
                      <span className="text-gray-500 text-sm">Enregistrement...</span>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-700">
                      Vous devez vous{" "}
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href="/auth">connecter</Link>
                      </Button>{" "}
                      pour noter ce document.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Comments section */}
              <DocumentComments documentId={document.id} />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
