import Navbar from "@/components/landing/layout/Navbar";
import Footer from "@/components/landing/layout/Footer";
import Hero from "@/components/landing/sections/Hero";
import About from "@/components/landing/sections/About";
import HowItWorks from "@/components/landing/sections/HowItWorks";
import Team from "@/components/landing/sections/Team";
import "@/styles/landing.css";

export default function Home() {
  return (
    <div className="bk-landing">
      <Navbar />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Team />
      </main>
      <Footer />
    </div>
  );
}
