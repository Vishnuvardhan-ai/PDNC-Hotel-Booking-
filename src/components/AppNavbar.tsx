import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

const AppNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-heading text-xl font-bold text-gradient">
          RoomMatch
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Profile
              </Link>
              <Link to="/chat" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                AI Chat
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gradient-primary border-0 text-primary-foreground">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-card px-4 py-4 space-y-2">
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/profile" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>Profile</Link>
              <Link to="/chat" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>AI Chat</Link>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="block"><Button variant="ghost" size="sm" className="w-full">Sign In</Button></Link>
              <Link to="/register" className="block"><Button size="sm" className="w-full gradient-primary border-0 text-primary-foreground">Get Started</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default AppNavbar;
