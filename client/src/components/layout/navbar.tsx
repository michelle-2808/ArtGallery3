import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import CartDropdown from "@/components/cart/cart-dropdown";
import { useAuth } from "@/hooks/use-auth";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  const NavLinks = () => (
    <>
      <Link href="/">
        <Button variant="ghost">Home</Button>
      </Link>
      {user?.isAdmin && (
        <Link href="/admin">
          <Button variant="ghost">Admin</Button>
        </Link>
      )}
      {user ? (
        <>
          <CartDropdown />
          <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
            Logout
          </Button>
        </>
      ) : (
        <Link href="/auth">
          <Button>Login</Button>
        </Link>
      )}
    </>
  );

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-playfair font-bold">
              Amrutas Art Gallery
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col space-y-4 mt-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
