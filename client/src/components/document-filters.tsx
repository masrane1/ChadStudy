import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface Subject {
  id: number;
  name: string;
  color: string;
}

export default function DocumentFilters() {
  const [, setLocation] = useLocation();
  
  // Initialize states from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const [subjectId, setSubjectId] = useState<string>(searchParams.get("subjectId") || "all");
  const [year, setYear] = useState<string>(searchParams.get("year") || "all");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "");
  
  // Fetch subjects
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  // Generate years from 2010 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => (currentYear - i).toString());
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (subjectId && subjectId !== "all") params.set("subjectId", subjectId);
    if (year && year !== "all") params.set("year", year);
    if (searchQuery) params.set("search", searchQuery);
    
    const queryString = params.toString();
    setLocation(queryString ? `/?${queryString}` : "/", { replace: true });
  }, [subjectId, year, searchQuery, setLocation]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The URL is already updated via useEffect, so we don't need to do anything here
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        <div className="relative rounded-md shadow-sm flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            className="pl-10 w-full"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tous les sujets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les sujets</SelectItem>
              {subjects?.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Toutes les années" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les années</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  );
}
