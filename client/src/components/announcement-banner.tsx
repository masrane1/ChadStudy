import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Announcement {
  id: number;
  title: string;
  content: string;
  active: boolean;
  createdAt: string;
  createdBy: number;
}

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  
  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements?activeOnly=true"],
  });
  
  if (dismissed || !announcements || announcements.length === 0) {
    return null;
  }
  
  // Show only the most recent announcement
  const announcement = announcements[0];
  
  return (
    <div className="bg-purple-600 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Megaphone className="h-5 w-5 mr-2" />
            <p className="font-medium">{announcement.content}</p>
          </div>
          <button 
            className="text-white hover:text-gray-200 focus:outline-none"
            onClick={() => setDismissed(true)}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
