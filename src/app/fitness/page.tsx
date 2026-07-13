import { CategorySearch } from "@/components/CategorySearch";
import { Search, Dumbbell } from "lucide-react";
import Header from "@/components/Header";
import { categories, FUNCTIONAL_SLUGS, SEARCH_REGISTRY } from "@/domains/fitness/registry";
import FitnessClientGrid from "@/domains/fitness/components/ClientGrid";


export default function Home() {
  const total = categories.reduce((n, c) => n + c.tools.length, 0);
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Fitness" />
      <main>
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            6+ Free Fitness Tools —{" "}
            <span className="hero-gradient-text">BMI, Macros & Calories</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Track your health with BMI calculators, macro trackers, and calorie estimators. No signup required.
          </p>
          <CategorySearch categorySlug="fitness" placeholder="Search 6+ fitness tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

      <FitnessClientGrid />
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Fitness — built for athletes, coaches and beginners.
      </footer>
    </div>
  );
}
