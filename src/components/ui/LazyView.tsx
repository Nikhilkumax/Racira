"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";

interface LazyViewProps {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: string | number;
  rootMargin?: string;
  threshold?: number | number[];
}

export function LazyView({
  children,
  fallback,
  minHeight = "400px",
  rootMargin = "200px 0px", // Load slightly before it comes into view
  threshold = 0,
}: LazyViewProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver is not supported, just render the content
    if (typeof IntersectionObserver === "undefined") {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            // Once it's loaded, we don't need to observe it anymore
            if (ref.current) {
              observer.unobserve(ref.current);
            }
          }
        });
      },
      { rootMargin, threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold]);

  if (isIntersecting) {
    return <>{children}</>;
  }

  return (
    <div ref={ref} style={{ minHeight }} className="w-full">
      {fallback || (
        <div 
          className="w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-lg border border-border/50"
          style={{ minHeight }}
        >
          <span className="text-muted-foreground text-sm">Loading view...</span>
        </div>
      )}
    </div>
  );
}
