import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  documentId: number;
  isFavorite: boolean;
}

export default function FavoriteButton({ documentId, isFavorite: initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/documents/${documentId}/favorites`);
      return res.json();
    },
    onSuccess: () => {
      setIsFavorite(true);
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Ajouté aux favoris",
        description: "Le document a été ajouté à vos favoris.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout aux favoris.",
        variant: "destructive",
      });
    },
  });
  
  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/documents/${documentId}/favorites`);
      return res.json();
    },
    onSuccess: () => {
      setIsFavorite(false);
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Retiré des favoris",
        description: "Le document a été retiré de vos favoris.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du retrait des favoris.",
        variant: "destructive",
      });
    },
  });
  
  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };
  
  const isPending = addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;
  
  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      onClick={handleToggleFavorite}
      disabled={isPending}
      className={isFavorite ? "bg-red-600 hover:bg-red-700" : ""}
    >
      <Heart
        className={`h-5 w-5 mr-2 ${isFavorite ? "fill-current" : ""}`}
      />
      {isPending 
        ? "Chargement..." 
        : isFavorite 
          ? "Retiré des favoris" 
          : "Ajouter aux favoris"
      }
    </Button>
  );
}
