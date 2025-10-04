import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, MapPin, Globe, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyInfoProps {
  organizationName: string;
  brandName?: string | null;
  companyDescription?: string | null;
  showTeamSize?: boolean;
  showLocation?: boolean;
  socialLinks?: any;
  primaryColor?: string | null;
}

export function CompanyInfo({
  organizationName,
  brandName,
  companyDescription,
  showTeamSize,
  showLocation,
  socialLinks,
  primaryColor
}: CompanyInfoProps) {
  const displayName = brandName || organizationName;
  const links = socialLinks || {};

  if (!companyDescription && !showTeamSize && !showLocation && !links.website && !links.linkedin && !links.twitter) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" style={{ color: primaryColor || undefined }} />
          About {displayName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {companyDescription && (
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {companyDescription}
          </p>
        )}

        {(showTeamSize || showLocation) && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {showTeamSize && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Growing team</span>
              </div>
            )}
            {showLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Multiple locations</span>
              </div>
            )}
          </div>
        )}

        {(links.website || links.linkedin || links.twitter) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {links.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={links.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            {links.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {links.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a href={links.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
