import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Racira",
  description: "Learn more about Racira, our mission, and the tools we build.",
};

const About = () => (
  <>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
    <div className="racira-page-container py-8 max-w-3xl">
      <h1 className="text-3xl font-extrabold mb-6">About Racira</h1>
      <div className="prose-finance">
        <h2>Our Mission</h2>
        <p>
          Racira is a unified platform of browser-based tools built around a simple idea:
          the everyday tools you need should be fast, free, and private. Instead of
          downloading software or juggling a dozen single-purpose websites, everything
          lives in one place and runs right in your browser.
        </p>

        <h2>What We Offer</h2>
        <p>
          Racira spans multiple tool categories — calculators for finance, health, math,
          and everyday life; PDF, image, photo, and video utilities; color, typography,
          design, and animation tools; voice synthesis; developer and SEO utilities;
          writing tools; and a collection of browser-based games. Each tool is built to
          work in your browser, with your data staying on your device.
        </p>

        <h2>Our Commitment to Accuracy and Quality</h2>
        <p>
          We care about correctness. Our calculators use standard, industry-recognized
          formulas, and we test our tools to keep them reliable. That said, we want to be
          transparent: results are estimates intended for informational and educational
          purposes. They do not constitute professional advice, and actual outcomes may
          differ based on your specific situation.
        </p>

        <h2>Privacy First</h2>
        <p>
          Your data never has to leave your browser. We do not store, transmit, or share
          the content you process with our tools. Privacy is a core part of how we build.
        </p>

        <h2>Long-Term Vision</h2>
        <p>
          We are committed to growing Racira into a comprehensive resource — adding new
          categories, refining existing tools, and keeping everything fast, free, and
          private.
        </p>
      </div>
      <PopularCalculators />
    </div>
  </>
);

export default About;
