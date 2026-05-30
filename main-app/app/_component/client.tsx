"use client";

import { authClient } from "@/lib/auth-client";
import { FeaturesSection } from "./landing/features-section";
import { FinalCta } from "./landing/final-cta";
import { Footer } from "./landing/footer";
import { HeroSection } from "./landing/hero-section";
import { LandingBackground } from "./landing/landing-background";
import { LandingNavbar } from "./landing/landing-navbar";
import { PricingSection } from "./landing/pricing-section";
import { ProductSection } from "./landing/product-section";
import { TestimonialsSection } from "./landing/testimonials-section";
import { TrustStrip } from "./landing/trust-strip";
import { UseCaseSection } from "./landing/use-case-section";
import { WorkflowSection } from "./landing/workflow-section";

export default function Client() {
  const { data: session } = authClient.useSession();
  const authenticated = Boolean(session?.user);
  const name = session?.user?.name?.split(" ")[0];
  const primaryHref = authenticated ? "/chat" : "/login";
  const pricingHref = authenticated ? "/pricing" : "/login";

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <LandingBackground />
      <LandingNavbar authenticated={authenticated} primaryHref={primaryHref} />
      <HeroSection
        authenticated={authenticated}
        name={name}
        primaryHref={primaryHref}
      />
      <TrustStrip />
      <ProductSection primaryHref={primaryHref} />
      <FeaturesSection />
      <WorkflowSection />
      <UseCaseSection />
      <PricingSection primaryHref={primaryHref} pricingHref={pricingHref} />
      <TestimonialsSection />
      <FinalCta primaryHref={primaryHref} />
      <Footer />
    </main>
  );
}
