import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/admin/sidebar";
import DocumentForm, { DocumentFormValues } from "@/components/admin/document-form";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Download,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Book,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Document {
  id: number;
  title: string;
  description: string;
  year: number;
  subjectId: number;
  subject: string;
  subjectColor: string;
  fileName: string;
  fileSize: number;
  downloads: number;
  createdAt: string;
}

export default function DocumentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  
  // Fetch documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  // Add document mutation
  const addDocumentMutation = useMutation({
    mutationFn: async (document: DocumentFormValues) => {
      const res = await apiRequest("POST", "/api/admin/documents", document);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setShowAddDialog(false);
      toast({
        title: "Document ajouté",
        description: "Le document a été ajouté avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du document",
        variant: "destructive",
      });
    },
  });
  
  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DocumentFormValues }) => {
      const res = await apiRequest("PUT", `/api/admin/documents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setEditingDocument(null);
      toast({
        title: "Document mis à jour",
        description: "Le document a été mis à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du document",
        variant: "destructive",
      });
    },
  });
  
  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/documents/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setDocumentToDelete(null);
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression du document",
        variant: "destructive",
      });
    },
  });
  
  const handleAddDocument = (data: DocumentFormValues) => {
    addDocumentMutation.mutate(data);
  };
  
  const handleUpdateDocument = (data: DocumentFormValues) => {
    if (editingDocument) {
      updateDocumentMutation.mutate({ id: editingDocument.id, data });
    }
  };
  
  const handleDeleteDocument = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id);
    }
  };
  
  const filteredDocuments = searchQuery.trim() === ""
    ? documents
    : documents?.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des documents</h1>
            <p className="text-gray-600">Gérez les documents disponibles sur la plateforme</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Rechercher..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau document</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations ci-dessous pour ajouter un nouveau document.
                  </DialogDescription>
                </DialogHeader>
                <DocumentForm 
                  onSubmit={handleAddDocument} 
                  isSubmitting={addDocumentMutation.isPending} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="border rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Titre</TableHead>
                  <TableHead className="w-[150px]">Matière</TableHead>
                  <TableHead className="w-[100px]">Année</TableHead>
                  <TableHead className="w-[120px]">Taille</TableHead>
                  <TableHead className="w-[120px]">Téléchargements</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Book className="h-4 w-4 mr-1 text-primary-500" />
                        {document.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {document.year}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(document.fileSize / 1024 / 1024).toFixed(1)} MB
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1 text-gray-500" />
                        {document.downloads}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog open={!!editingDocument} onOpenChange={(open) => !open && setEditingDocument(null)}>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={() => setEditingDocument(document)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </DialogTrigger>
                            {editingDocument && (
                              <DialogContent className="sm:max-w-[800px]">
                                <DialogHeader>
                                  <DialogTitle>Modifier le document</DialogTitle>
                                  <DialogDescription>
                                    Modifiez les informations du document.
                                  </DialogDescription>
                                </DialogHeader>
                                <DocumentForm 
                                  documentId={editingDocument.id}
                                  initialData={{
                                    title: editingDocument.title,
                                    description: editingDocument.description,
                                    year: editingDocument.year,
                                    subjectId: editingDocument.subjectId,
                                    fileName: editingDocument.fileName,
                                    fileSize: editingDocument.fileSize,
                                  }} 
                                  onSubmit={handleUpdateDocument} 
                                  isSubmitting={updateDocumentMutation.isPending} 
                                />
                              </DialogContent>
                            )}
                          </Dialog>
                          
                          <AlertDialog 
                            open={!!documentToDelete} 
                            onOpenChange={(open) => !open && setDocumentToDelete(null)}
                          >
                            <DropdownMenuItem 
                              onSelect={() => setDocumentToDelete(document)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                            
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce document ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le document sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDeleteDocument}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deleteDocumentMutation.isPending ? (
                                    "Suppression en cours..."
                                  ) : (
                                    "Supprimer"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-lg border p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun document trouvé</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchQuery.trim() === ""
                ? "Aucun document n'est disponible. Commencez par en ajouter un."
                : "Aucun document ne correspond à votre recherche."}
            </p>
            {searchQuery.trim() !== "" ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Réinitialiser la recherche
              </Button>
            ) : (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un document
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
