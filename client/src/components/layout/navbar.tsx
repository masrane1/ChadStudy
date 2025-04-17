import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, User, BookOpen, Settings, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAdmin, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { href: "/", label: "Accueil", active: location === "/" },
    { href: "/", label: "Documents", active: location.startsWith("/documents") },
    { href: "/", label: "À propos", active: location === "/about" },
    { href: "/", label: "Contact", active: location === "/contact" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-primary-600 text-2xl font-bold">Bac-Hub</span>
            <span className="ml-1 text-green-500 font-medium">Tchad</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${
                  link.active
                    ? "text-primary-600"
                    : "text-gray-700 hover:text-primary-500"
                } font-medium transition-colors`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 font-medium"
                  >
                    <span>{user.fullName || user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Mon profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <BookOpen className="h-4 w-4" />
                      <span>Mes favoris</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                          <span>Administration</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 flex items-center gap-2 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">S'inscrire</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[300px]">
              <div className="flex flex-col h-full py-6">
                <div className="flex-1 flex flex-col space-y-4 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`${
                        link.active
                          ? "text-primary-600"
                          : "text-gray-700 hover:text-primary-500"
                      } font-medium px-2 py-1 rounded`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 flex flex-col space-y-2">
                  {user ? (
                    <>
                      <div className="px-2 py-2 text-sm font-medium text-gray-500">
                        Connecté en tant que {user.username}
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-2 py-2 text-gray-700 hover:text-primary-500 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Mon profil</span>
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-2 py-2 text-gray-700 hover:text-primary-500 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Mes favoris</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-2 py-2 text-gray-700 hover:text-primary-500 font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Administration</span>
                        </Link>
                      )}
                      <button
                        className="flex items-center gap-2 px-2 py-2 text-red-500 hover:text-red-600 font-medium"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Déconnexion</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2 px-2">
                      <Button asChild>
                        <Link
                          href="/auth"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Se connecter
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                        className="text-primary-600 border-primary-600"
                      >
                        <Link
                          href="/auth"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          S'inscrire
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
