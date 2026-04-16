import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Sparkles, Shield, ArrowRight } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-24 md:py-40 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered Roommate Matching
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
              Find Your
              <br />
              <span className="text-gradient">Perfect Roommate</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Smart compatibility scoring matches you with roommates who share your lifestyle, budget, and habits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to={user ? "/dashboard" : "/register"}>
                <Button size="lg" className="gradient-primary border-0 text-primary-foreground px-8 text-base">
                  Get Started <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Sparkles, title: "AI Matching", desc: "Our algorithm scores compatibility across 5 key dimensions." },
            { icon: Users, title: "Verified Profiles", desc: "Detailed profiles with lifestyle, budget, and habit preferences." },
            { icon: Shield, title: "Safe & Secure", desc: "Your data is protected. Connect only with people you approve." },
          ].map((f, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-card shadow-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-lg font-bold text-card-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 RoomMatch. Smart Roommate Finder.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
