import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, Building2, Loader2 } from 'lucide-react';
import { usePublicJobs } from '@/hooks/usePublicJobs';
import { BrandedCareerHeader } from '@/components/BrandedCareerHeader';
import { CareerBanner } from '@/components/CareerBanner';
import { CompanyInfo } from '@/components/CompanyInfo';

export default function Careers() {
  const { jobs, loading } = usePublicJobs();
  
  // Get branding from first job (all jobs from same org in this view)
  const branding = jobs.length > 0 ? jobs[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-background to-muted"
      style={{
        '--brand-primary': branding?.primary_color || '#0ea5e9',
        '--brand-secondary': branding?.secondary_color || '#8b5cf6',
      } as React.CSSProperties}
    >
      {/* Custom CSS */}
      {branding?.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: branding.custom_css }} />
      )}

      {/* Header */}
      <BrandedCareerHeader
        organizationName={branding?.organization_name || 'Careers Portal'}
        brandName={branding?.brand_name}
        logoUrl={branding?.logo_url}
        primaryColor={branding?.primary_color}
      />

      {/* Hero Section */}
      <CareerBanner
        bannerUrl={branding?.careers_banner_url}
        tagline={branding?.careers_tagline}
        organizationName={branding?.organization_name || 'Our Company'}
        brandName={branding?.brand_name}
        primaryColor={branding?.primary_color}
        secondaryColor={branding?.secondary_color}
      />

      {/* Company Info */}
      {branding && (
        <section className="container mx-auto px-4 pb-8">
          <CompanyInfo
            organizationName={branding.organization_name}
            brandName={branding.brand_name}
            companyDescription={branding.company_description}
            showTeamSize={branding.show_team_size}
            showLocation={branding.show_location}
            socialLinks={branding.social_links}
            primaryColor={branding.primary_color}
          />
        </section>
      )}

      {/* Jobs Listing */}
      <section className="container mx-auto px-4 pb-16">
        {jobs.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Open Positions</h3>
              <p className="text-muted-foreground">
                Check back soon for new opportunities
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{job.employment_type || 'Full-time'}</Badge>
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.organization_name}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    {job.department && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {job.department}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Link to={`/careers/${job.id}`}>
                    <Button 
                      className="w-full"
                      style={{
                        backgroundColor: job.primary_color || undefined,
                      }}
                    >
                      View Details & Apply
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {branding?.brand_name || branding?.organization_name || 'NexHire'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
