import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

// Type pour les paramètres de paramètres
interface Setting {
  id: number;
  key: string;
  value: string;
}

export default function SettingsForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState("contact");
  
  // Fetch settings
  const { data: settings, isLoading, isError } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiRequest("POST", "/api/admin/settings", { key, value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres ont été mis à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour des paramètres",
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string, defaultValue: string = "") => {
    if (!settings) return defaultValue;
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const handleSettingChange = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handleQuickLinksChange = (links: Array<{ name: string; href: string }>) => {
    const value = JSON.stringify(links);
    updateSettingMutation.mutate({ key: "footer_quick_links", value });
  };

  // État local pour l'édition des liens rapides
  const [quickLinks, setQuickLinks] = useState<Array<{ name: string; href: string }>>([]);
  
  // Charger les liens rapides une fois que les paramètres sont disponibles
  const [quickLinksLoaded, setQuickLinksLoaded] = useState(false);
  if (settings && !quickLinksLoaded) {
    try {
      const links = JSON.parse(getSetting("footer_quick_links", "[]"));
      setQuickLinks(links);
      setQuickLinksLoaded(true);
    } catch (e) {
      console.error("Error parsing quick links:", e);
      setQuickLinks([]);
      setQuickLinksLoaded(true);
    }
  }

  // Fonction pour mettre à jour un lien rapide
  const updateQuickLink = (index: number, field: "name" | "href", value: string) => {
    const updatedLinks = [...quickLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setQuickLinks(updatedLinks);
  };

  // Fonction pour ajouter un nouveau lien rapide
  const addQuickLink = () => {
    setQuickLinks([...quickLinks, { name: "", href: "" }]);
  };

  // Fonction pour supprimer un lien rapide
  const removeQuickLink = (index: number) => {
    const updatedLinks = quickLinks.filter((_, i) => i !== index);
    setQuickLinks(updatedLinks);
  };

  // Fonction pour sauvegarder les liens rapides
  const saveQuickLinks = () => {
    handleQuickLinksChange(quickLinks);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        Une erreur est survenue lors du chargement des paramètres.
      </div>
    );
  }

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
        <TabsTrigger value="content">Contenu</TabsTrigger>
        <TabsTrigger value="links">Liens</TabsTrigger>
      </TabsList>

      <TabsContent value="contact" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations de contact</CardTitle>
            <CardDescription>
              Gérez les informations de contact affichées dans le pied de page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                value={getSetting("footer_email")}
                onChange={(e) => handleSettingChange("footer_email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="text"
                placeholder="+235 XX XX XX XX"
                value={getSetting("footer_phone")}
                onChange={(e) => handleSettingChange("footer_phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                type="text"
                placeholder="N'Djamena, Tchad"
                value={getSetting("footer_address")}
                onChange={(e) => handleSettingChange("footer_address", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="social" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Réseaux sociaux</CardTitle>
            <CardDescription>
              Configurez les liens vers vos réseaux sociaux.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                placeholder="https://facebook.com/votre-page"
                value={getSetting("social_facebook")}
                onChange={(e) => handleSettingChange("social_facebook", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                type="url"
                placeholder="https://twitter.com/votre-compte"
                value={getSetting("social_twitter")}
                onChange={(e) => handleSettingChange("social_twitter", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                placeholder="https://instagram.com/votre-compte"
                value={getSetting("social_instagram")}
                onChange={(e) => handleSettingChange("social_instagram", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Contenu du pied de page</CardTitle>
            <CardDescription>
              Modifiez le texte affiché dans le pied de page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Votre plateforme de ressources éducatives..."
                value={getSetting("footer_description")}
                onChange={(e) => handleSettingChange("footer_description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="copyright">
                Copyright (utilisez {"{year}"} pour l'année courante)
              </Label>
              <Input
                id="copyright"
                type="text"
                placeholder="© {year} Bac-Hub Tchad. Tous droits réservés."
                value={getSetting("footer_copyright")}
                onChange={(e) => handleSettingChange("footer_copyright", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="links" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Liens rapides</CardTitle>
            <CardDescription>
              Gérez les liens affichés dans la section "Liens rapides" du pied de page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickLinks.map((link, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 pb-4 border-b">
                  <div className="flex-1">
                    <Label htmlFor={`link-name-${index}`}>Nom</Label>
                    <Input
                      id={`link-name-${index}`}
                      type="text"
                      value={link.name}
                      onChange={(e) => updateQuickLink(index, "name", e.target.value)}
                      placeholder="Accueil"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`link-href-${index}`}>URL</Label>
                    <Input
                      id={`link-href-${index}`}
                      type="text"
                      value={link.href}
                      onChange={(e) => updateQuickLink(index, "href", e.target.value)}
                      placeholder="/"
                    />
                  </div>
                  <div className="flex items-end mt-auto">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuickLink(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={addQuickLink}>
                  Ajouter un lien
                </Button>
                <Button onClick={saveQuickLinks}>
                  Enregistrer les liens
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}