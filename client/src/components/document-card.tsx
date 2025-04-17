import { Link } from "wouter";
import { MessageSquare, Download } from "lucide-react";
import StarRating from "@/components/ui/star-rating";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface SubjectBadgeProps {
  name: string;
  color: string;
}

const SubjectBadge = ({ name, color }: SubjectBadgeProps) => {
  const getColorClass = () => {
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
    <span className={`${getColorClass()} text-xs font-medium px-2.5 py-0.5 rounded`}>
      {name}
    </span>
  );
};

interface DocumentCardProps {
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

export default function DocumentCard({
  id,
  title,
  description,
  year,
  subject,
  subjectColor,
  fileName,
  fileSize,
  averageRating,
  ratingCount,
  commentCount,
}: DocumentCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };
  
  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      
      toast({
        title: "Connexion requise",
        description: "Vous devez vous connecter pour télécharger ce document.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <SubjectBadge name={subject} color={subjectColor} />
          <span className="text-gray-500 text-sm">{year}</span>
        </div>
        <Link href={`/documents/${id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <StarRating value={averageRating} count={ratingCount} readonly size="sm" />
          <span className="text-xs text-gray-500">{formatFileSize(fileSize)}</span>
        </div>
      </div>
      <div className="flex border-t border-gray-100">
        <Link href={`/documents/${id}`} className="flex-1 py-3 px-4 text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center justify-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          {commentCount} commentaire{commentCount !== 1 ? "s" : ""}
        </Link>
        <Link 
          href={user ? `/api/documents/${id}/download` : "/auth"}
          className="flex-1 py-3 px-4 text-primary-600 hover:bg-primary-50 text-sm font-medium flex items-center justify-center"
          onClick={handleDownloadClick}
        >
          <Download className="h-4 w-4 mr-1" />
          Télécharger
        </Link>
      </div>
    </div>
  );
}
