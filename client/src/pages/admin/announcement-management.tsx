import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/admin/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Megaphone,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  ToggleLeft,
} from "lucide-react";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Announcement {
  id: number;
  title: string;
  content: string;
  active: boolean;
  createdAt: string;
  createdBy: number;
}

const announcementFormSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  active: z.boolean().default(true),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export default function AnnouncementManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  
  // Fetch announcements
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });
  
  // Add announcement form
  const addForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
      active: true,
    },
  });
  
  // Edit announcement form
  const editForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: editingAnnouncement?.title || "",
      content: editingAnnouncement?.content || "",
      active: editingAnnouncement?.active || true,
    },
  });
  
  // Update form when editing announcement changes
  useState(() => {
    if (editingAnnouncement) {
      editForm.reset({
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        active: editingAnnouncement.active,
      });
    }
  });
  
  // Add announcement mutation
  const addAnnouncementMutation = useMutation({
    mutationFn: async (announcement: AnnouncementFormValues) => {
      const res = await apiRequest("POST", "/api/admin/announcements", announcement);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setShowAddDialog(false);
      addForm.reset();
      toast({
        title: "Annonce ajoutée",
        description: "L'annonce a été ajoutée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de l'annonce",
        variant: "destructive",
      });
    },
  });
  
  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AnnouncementFormValues }) => {
      const res = await apiRequest("PUT", `/api/admin/announcements/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setEditingAnnouncement(null);
      toast({
        title: "Annonce mise à jour",
        description: "L'annonce a été mise à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de l'annonce",
        variant: "destructive",
      });
    },
  });
  
  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/announcements/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setAnnouncementToDelete(null);
      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de l'annonce",
        variant: "destructive",
      });
    },
  });
  
  const onAddSubmit = (data: AnnouncementFormValues) => {
    addAnnouncementMutation.mutate(data);
  };
  
  const onEditSubmit = (data: AnnouncementFormValues) => {
    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncement.id, data });
    }
  };
  
  const handleDeleteAnnouncement = () => {
    if (announcementToDelete) {
      deleteAnnouncementMutation.mutate(announcementToDelete.id);
    }
  };
  
  const filteredAnnouncements = searchQuery.trim() === ""
    ? announcements
    : announcements?.filter(announcement => 
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des annonces</h1>
            <p className="text-gray-600">Gérez les annonces affichées sur la plateforme</p>
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle annonce</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle annonce qui sera affichée sur la plateforme.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre</FormLabel>
                          <FormControl>
                            <Input placeholder="Titre de l'annonce" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contenu</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Contenu de l'annonce" 
                              rows={4} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Activer l'annonce</FormLabel>
                            <FormDescription>
                              L'annonce sera visible sur la plateforme si activée.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddDialog(false)}
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addAnnouncementMutation.isPending}
                      >
                        {addAnnouncementMutation.isPending ? "Ajout en cours..." : "Ajouter"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredAnnouncements && filteredAnnouncements.length > 0 ? (
          <div className="border rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Titre</TableHead>
                  <TableHead>Contenu</TableHead>
                  <TableHead className="w-[100px]">Statut</TableHead>
                  <TableHead className="w-[180px]">Date de création</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Megaphone className="h-4 w-4 mr-2 text-primary-500" />
                        {announcement.title}
                      </div>
                    </TableCell>
                    <TableCell className="truncate max-w-[300px]">
                      {announcement.content}
                    </TableCell>
                    <TableCell>
                      {announcement.active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        {format(new Date(announcement.createdAt), 'dd MMM yyyy', { locale: fr })}
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
                          <Dialog 
                            open={editingAnnouncement?.id === announcement.id} 
                            onOpenChange={(open) => !open && setEditingAnnouncement(null)}
                          >
                            <DialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={() => setEditingAnnouncement(announcement)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </DialogTrigger>
                            
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modifier l'annonce</DialogTitle>
                                <DialogDescription>
                                  Modifiez les détails de l'annonce.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                                  <FormField
                                    control={editForm.control}
                                    name="title"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Titre</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="content"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Contenu</FormLabel>
                                        <FormControl>
                                          <Textarea rows={4} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={editForm.control}
                                    name="active"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                          <FormLabel>Activer l'annonce</FormLabel>
                                          <FormDescription>
                                            L'annonce sera visible sur la plateforme si activée.
                                          </FormDescription>
                                        </div>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <div className="flex justify-end gap-3">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => setEditingAnnouncement(null)}
                                    >
                                      Annuler
                                    </Button>
                                    <Button 
                                      type="submit" 
                                      disabled={updateAnnouncementMutation.isPending}
                                    >
                                      {updateAnnouncementMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          
                          <DropdownMenuItem
                            onSelect={() => {
                              updateAnnouncementMutation.mutate({
                                id: announcement.id,
                                data: {
                                  ...announcement,
                                  active: !announcement.active
                                }
                              });
                            }}
                          >
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            {announcement.active ? "Désactiver" : "Activer"}
                          </DropdownMenuItem>
                          
                          <AlertDialog 
                            open={announcementToDelete?.id === announcement.id} 
                            onOpenChange={(open) => !open && setAnnouncementToDelete(null)}
                          >
                            <DropdownMenuItem 
                              onSelect={() => setAnnouncementToDelete(announcement)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                            
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette annonce ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. L'annonce sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDeleteAnnouncement}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deleteAnnouncementMutation.isPending ? (
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
              <Megaphone className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune annonce trouvée</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchQuery.trim() === ""
                ? "Aucune annonce n'est disponible. Commencez par en ajouter une."
                : "Aucune annonce ne correspond à votre recherche."}
            </p>
            {searchQuery.trim() !== "" ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Réinitialiser la recherche
              </Button>
            ) : (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une annonce
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
