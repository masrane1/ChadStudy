import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const subjects = [
    { name: "Mathématiques", href: "/?subject=1" },
    { name: "Physique-Chimie", href: "/?subject=2" },
    { name: "SVT", href: "/?subject=3" },
    { name: "Français", href: "/?subject=4" },
    { name: "Philosophie", href: "/?subject=5" },
  ];

  const quickLinks = [
    { name: "Accueil", href: "/" },
    { name: "Documents", href: "/" },
    { name: "À propos", href: "/" },
    { name: "Contact", href: "/" },
  ];

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
              Votre plateforme de ressources éducatives pour réussir votre baccalauréat.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
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
              {subjects.map((subject) => (
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
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">contact@bachub-tchad.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">+235 XX XX XX XX</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-400">N'Djamena, Tchad</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Bac-Hub Tchad. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
