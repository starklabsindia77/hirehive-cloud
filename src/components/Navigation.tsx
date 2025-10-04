import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, LayoutDashboard, Home, LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { organization } = useOrganization();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TalentFlow</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {user && (
              <>
                <Button
                  variant={isActive("/dashboard") ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
                <Button
                  variant={isActive("/jobs") ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to="/jobs" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">Jobs</span>
                  </Link>
                </Button>
                <Button
                  variant={isActive("/candidates") ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to="/candidates" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Candidates</span>
                  </Link>
                </Button>
                {organization && (
                  <Badge variant="outline" className="gap-2">
                    <Building2 className="h-3 w-3" />
                    <span className="hidden sm:inline">{organization.name}</span>
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
            {!user && (
              <Button size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
