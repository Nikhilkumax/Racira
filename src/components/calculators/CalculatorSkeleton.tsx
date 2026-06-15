"use client";

import React from "react";

export default function CalculatorSkeleton() {
  return (
    <div className="container-page py-4 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-muted rounded mb-6 mt-2"></div>
      
      {/* Title Skeleton */}
      <div className="h-10 w-64 bg-muted rounded mb-4"></div>
      
      {/* Description Skeleton */}
      <div className="h-4 w-full max-w-3xl bg-muted rounded mb-8"></div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Form Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-[400px] w-full bg-card border rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="h-5 w-32 bg-muted rounded mb-2"></div>
              <div className="h-11 w-full bg-muted/50 rounded"></div>
              <div className="h-5 w-48 bg-muted rounded mb-2 mt-4"></div>
              <div className="h-11 w-full bg-muted/50 rounded"></div>
              <div className="h-5 w-24 bg-muted rounded mb-2 mt-4"></div>
              <div className="h-11 w-full bg-muted/50 rounded"></div>
            </div>
            <div className="h-11 w-full bg-primary/20 rounded mt-8"></div>
          </div>
        </div>
        
        {/* Right Panel Skeleton */}
        <div className="flex-1">
          <div className="h-[300px] w-full bg-muted/30 border rounded-lg p-6">
            <div className="h-6 w-40 bg-muted rounded mb-6"></div>
            <div className="h-12 w-48 bg-muted rounded mb-4"></div>
            <div className="h-4 w-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
