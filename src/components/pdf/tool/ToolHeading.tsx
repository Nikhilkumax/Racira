import type { LucideIcon } from "lucide-react";

interface ToolHeadingProps {
  name: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Single `<h1>` (exact tool name) with a one-sentence subtitle and the
 * tool icon in the brand red-on-light-pink chip style used across the site.
 */
const ToolHeading = ({ name, description, icon: Icon }: ToolHeadingProps) => {
  return (
    <div className="text-center animate-fade-in">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h1 className="font-bold text-foreground text-2xl sm:text-3xl">{name}</h1>
      <p className="mt-2 text-muted-foreground max-w-xl mx-auto">{description}</p>
    </div>
  );
};

export default ToolHeading;
