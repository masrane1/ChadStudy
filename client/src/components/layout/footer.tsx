import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to parse JSON safely
const safeParseJSON = (str: string | null | undefined, defaultValue: any = null) => {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return defaultValue;
  }
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Fetch settings from API
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Parse footer settings or use defaults
  const getSetting = (key: string, defaultValue: string = "") => {
    if (isLoading || !settings) return defaultValue;
    const setting = settings.find((s: any) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  // Contact information
  const email = getSetting("footer_email", "contact@bachub-tchad.com");
  const phone = getSetting("footer_phone", "+235 XX XX XX XX");
  const address = getSetting("footer_address", "N'Djamena, Tchad");
  
  // Social media links
  const facebookUrl = getSetting("social_facebook", "#");
  const twitterUrl = getSetting("social_twitter", "#");
  const instagramUrl = getSetting("social_instagram", "#");
  
  // Description
  const description = getSetting(
    "footer_description", 
    "Votre plateforme de ressources éducatives pour réussir votre baccalauréat."
  );
  
  // Copyright text
  const copyrightText = getSetting(
    "footer_copyright", 
    `© ${currentYear} Bac-Hub Tchad. Tous droits réservés.`
  ).replace("{year}", currentYear.toString());
  
  // Quick links and subjects from settings or default
  const quickLinks = safeParseJSON(getSetting("footer_quick_links"), [
    { name: "Accueil", href: "/" },
    { name: "Documents", href: "/" },
    { name: "À propos", href: "/" },
    { name: "Contact", href: "/" },
  ]);

  // Fetch subjects from API for the subject links
  const { data: subjectsData } = useQuery({
    queryKey: ["/api/subjects"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const subjects = subjectsData?.map((subject: any) => ({
    name: subject.name, 
    href: `/?subject=${subject.id}`
  })) || [];

  // Loading state for the footer
  if (isLoading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="h-10 w-32 bg-gray-800 mb-4" />
              <Skeleton className="h-20 w-full bg-gray-800 mb-6" />
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-6 rounded-full bg-gray-800" />
                <Skeleton className="h-6 w-6 rounded-full bg-gray-800" />
                <Skeleton className="h-6 w-6 rounded-full bg-gray-800" />
              </div>
            </div>
            
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-6 w-32 bg-gray-800 mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-5 w-full bg-gray-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <Skeleton className="h-5 w-1/2 mx-auto bg-gray-800" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-white text-2xl font-bold">Bac-Hub</span>
              <span className="ml-1 text-green-500 font-medium">Tchad</span>
            </Link>
            <p className="text-gray-400 mb-6">
              {description}
            </p>
            <div className="flex space-x-4">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              {quickLinks.map((link: any) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Matières</h3>
            <ul className="space-y-2">
              {subjects.slice(0, 5).map((subject: any) => (
                <li key={subject.name}>
                  <Link
                    href={subject.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {subject.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              {email && (
                <li className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">{email}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">{phone}</span>
                </li>
              )}
              {address && (
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-gray-400">{address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p dangerouslySetInnerHTML={{ __html: copyrightText }} />
        </div>
      </div>
    </footer>
  );
}
