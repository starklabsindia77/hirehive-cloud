interface CareerBannerProps {
  bannerUrl?: string | null;
  tagline?: string | null;
  organizationName: string;
  brandName?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export function CareerBanner({
  bannerUrl,
  tagline,
  organizationName,
  brandName,
  primaryColor,
  secondaryColor
}: CareerBannerProps) {
  const displayName = brandName || organizationName;
  const defaultTagline = `Find Your Next Opportunity at ${displayName}`;

  return (
    <section 
      className="relative py-20 bg-gradient-to-b from-primary/10 to-background"
      style={{
        backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {bannerUrl && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{
            background: primaryColor && secondaryColor 
              ? `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
              : undefined,
            WebkitBackgroundClip: primaryColor && secondaryColor ? 'text' : undefined,
            WebkitTextFillColor: primaryColor && secondaryColor ? 'transparent' : undefined,
          }}
        >
          {tagline || defaultTagline}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover open positions and take the next step in your career
        </p>
      </div>
    </section>
  );
}
