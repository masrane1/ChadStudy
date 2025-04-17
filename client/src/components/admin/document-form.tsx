import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";

interface DocumentFormProps {
  documentId?: number;
  initialData?: {
    title: string;
    description: string;
    year: number;
    subjectId: number;
    fileName?: string;
    fileSize?: number;
  };
  onSubmit: (data: DocumentFormValues) => void;
  isSubmitting: boolean;
}

interface Subject {
  id: number;
  name: string;
  color: string;
}

// Generate years from 2010 to current year
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2009 }, (_, i) => (currentYear - i).toString());

// Form schema
const documentFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  year: z.coerce.number().int().min(2010).max(currentYear),
  subjectId: z.coerce.number().int().positive("Veuillez sélectionner une matière"),
  file: z.any().optional(),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;

export default function DocumentForm({
  documentId,
  initialData,
  onSubmit,
  isSubmitting,
}: DocumentFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Fetch subjects
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  // Setup form with initial values
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      year: initialData?.year || currentYear,
      subjectId: initialData?.subjectId || 0,
      file: undefined,
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };
  
  const handleSubmit = (data: DocumentFormValues) => {
    // In a real application, we would need to handle file upload
    // For now, we'll just pass the form data to the parent component
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du document</FormLabel>
              <FormControl>
                <Input placeholder="Entrez le titre du document" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matière</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                    disabled={isLoadingSubjects}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Entrez une description détaillée du document"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="file"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Fichier</FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedFile 
                      ? `Fichier sélectionné: ${selectedFile.name}`
                      : initialData?.fileName
                        ? `Fichier actuel: ${initialData.fileName}`
                        : "Glissez-déposez un fichier ici, ou cliquez pour sélectionner"
                    }
                  </p>
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    onChange={handleFileChange}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    Sélectionner un fichier
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {documentId ? "Mettre à jour" : "Ajouter le document"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
