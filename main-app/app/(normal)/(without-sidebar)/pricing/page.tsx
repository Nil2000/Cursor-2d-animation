import { Metadata } from "next";
import { PricingHeader } from "./_components/pricing-header";
import { PricingCards } from "./_components/pricing-cards";
import { AddOnCredits } from "./_components/add-on-credits";
import { checkAuthentication } from "@/actions/authActions";
import { redirect } from "next/navigation";
// import { PricingFAQ } from "./_components/pricing-faq";

export const metadata: Metadata = {
  title: "Pricing - Manim AI",
  description: "Choose the perfect plan for your animation needs",
};

export default async function PricingPage() {
  const session = await checkAuthentication();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <PricingHeader />
        <PricingCards />
        <AddOnCredits />
        {/* <PricingFAQ /> */}
      </div>
    </div>
  );
}
