import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface CommentUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

interface Comment {
  id: number;
  documentId: number;
  userId: number;
  content: string;
  createdAt: string;
  isAdminResponse: boolean;
  parentId?: number;
  user: CommentUser;
}

interface DocumentCommentsProps {
  documentId: number;
}

export default function DocumentComments({ documentId }: DocumentCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  
  // Fetch comments for this document
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/documents/${documentId}/comments`],
  });
  
  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/documents/${documentId}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/comments`] });
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été ajouté avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du commentaire",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez vous connecter pour laisser un commentaire",
        variant: "destructive",
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Commentaire vide",
        description: "Veuillez saisir un commentaire",
        variant: "destructive",
      });
      return;
    }
    
    createCommentMutation.mutate(comment);
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Commentaires</h3>
      
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {getInitials(user.fullName || user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Votre commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createCommentMutation.isPending || !comment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
      
      {!user && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-700">
            Vous devez vous{" "}
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href="/auth">connecter</a>
            </Button>{" "}
            pour laisser un commentaire.
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-4">Chargement des commentaires...</div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {comment.user ? getInitials(comment.user.fullName || comment.user.username) : <User />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-semibold">
                        {comment.user?.fullName || comment.user?.username || "Utilisateur"}
                      </span>
                      {comment.user?.role === "admin" && (
                        <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Aucun commentaire pour le moment. Soyez le premier à commenter !
        </div>
      )}
    </div>
  );
}
