import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import DocumentCard from "@/components/document-card";
import DocumentFilters from "@/components/document-filters";
import AnnouncementBanner from "@/components/announcement-banner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Book, Search, MessageSquare } from "lucide-react";

interface Document {
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
}

export default function HomePage() {
  // Get query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const subjectId = searchParams.get("subjectId");
  const year = searchParams.get("year");
  const search = searchParams.get("search");
  
  // Construct API query URL with filters
  let queryUrl = "/api/documents";
  const queryParams = [];
  
  if (subjectId && subjectId !== "all") queryParams.push(`subjectId=${subjectId}`);
  if (year && year !== "all") queryParams.push(`year=${year}`);
  if (search) queryParams.push(`search=${search}`);
  
  if (queryParams.length > 0) {
    queryUrl += `?${queryParams.join("&")}`;
  }
  
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: [queryUrl],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AnnouncementBanner />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Réussissez votre Bac avec Bac-Hub Tchad</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Accédez à des milliers de sujets d'examens et ressources pédagogiques pour vous préparer efficacement.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="default" className="bg-white text-primary-600 hover:bg-gray-100">
                <a href="#documents" className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Parcourir les documents
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Documents Section */}
      <section id="documents" className="py-12 bg-gray-50 flex-grow">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Documents disponibles</h2>
              <p className="text-gray-600 mt-1">Explorez notre bibliothèque de ressources pédagogiques</p>
            </div>
            
            <DocumentFilters />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  description={doc.description}
                  year={doc.year}
                  subject={doc.subject}
                  subjectColor={doc.subjectColor}
                  fileName={doc.fileName}
                  fileSize={doc.fileSize}
                  averageRating={doc.averageRating}
                  ratingCount={doc.ratingCount}
                  commentCount={doc.commentCount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex justify-center items-center w-24 h-24 bg-gray-100 rounded-full mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun document trouvé</h3>
              <p className="text-gray-500 mb-6">
                Aucun document ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
          
          {/* Pagination (Static for now, would be dynamic in a real app) */}
          {documents && documents.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex rounded-md shadow">
                <Button variant="outline" size="sm" className="rounded-l-md">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button variant="outline" size="sm" className="border-l-0 border-r-0 text-primary-600">
                  1
                </Button>
                <Button variant="outline" size="sm" className="border-l-0 border-r-0">
                  2
                </Button>
                <Button variant="outline" size="sm" className="border-l-0 border-r-0">
                  3
                </Button>
                <Button variant="outline" size="sm" className="rounded-r-md">
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </nav>
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Comment Bac-Hub vous aide à réussir</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Notre plateforme vous offre tous les outils nécessaires pour préparer votre examen du baccalauréat efficacement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <Book className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Archives complètes</h3>
              <p className="text-gray-600">
                Accédez à une collection complète de sujets d'examens des années précédentes pour toutes les matières.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Corrigés détaillés</h3>
              <p className="text-gray-600">
                Étudiez avec des corrigés complets qui vous aident à comprendre les méthodes de résolution et les attentes des examinateurs.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Communauté d'entraide</h3>
              <p className="text-gray-600">
                Posez vos questions, partagez vos astuces et apprenez avec d'autres élèves et enseignants dans notre espace commentaires.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
