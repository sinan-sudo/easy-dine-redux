import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, LogOut, LayoutDashboard, CalendarDays, User, MessageCircle } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="font-heading text-xl font-semibold text-foreground">
            Easy<span className="text-primary">Dine</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/book">
                <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:text-primary">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Book</span>
                </Button>
              </Link>
              <Link to="/my-reservations">
                <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:text-primary">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">My Bookings</span>
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:text-primary">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Link to="/chat-support">
                <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:text-primary">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Support</span>
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:text-primary">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
              <NotificationBell />
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button size="sm" className="bg-gradient-gold text-primary-foreground font-semibold">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
