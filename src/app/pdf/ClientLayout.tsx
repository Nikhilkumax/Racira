"use client";

import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/pdf/ThemeProvider";
import { ToolWorkflowProvider } from "@/lib/pdf/ToolWorkflowContext";

import Footer from "@/components/Footer";

const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="theme-pdf flex min-h-screen flex-col">
            <Header mode="category" categoryName="PDF" />
            <div className="flex-1">
              <ToolWorkflowProvider>
                {children}
              </ToolWorkflowProvider>
            </div>
            <Footer />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
