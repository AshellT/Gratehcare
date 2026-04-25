import React from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import LogoCloud from "@/components/landing/LogoCloud";
import ProblemSolution from "@/components/landing/ProblemSolution";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import RoleBased from "@/components/landing/RoleBased";
import SocialProof from "@/components/landing/SocialProof";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const LandingPage: React.FC = () => {
  return (
    <main data-testid="landing-page" className="min-h-screen bg-white text-slate-900">
      <Header />
      <Hero />
      <LogoCloud />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <RoleBased />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default LandingPage;
