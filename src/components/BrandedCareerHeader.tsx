import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

interface BrandedCareerHeaderProps {
  organizationName: string;
  brandName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  showLogin?: boolean;
}

export function BrandedCareerHeader({
  organizationName,
  brandName,
  logoUrl,
  primaryColor,
  showLogin = true
}: BrandedCareerHeaderProps) {
  const displayName = brandName || organizationName;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${displayName} logo`}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <Briefcase 
                className="h-6 w-6" 
                style={{ color: primaryColor || undefined }}
              />
            )}
            <span className="text-xl font-bold">{displayName}</span>
          </div>
          {showLogin && (
            <Link to="/auth">
              <Button variant="outline">
                Employer Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
