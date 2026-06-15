export const trackPageView = (path: string, metadata?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Page View: ${path}`, metadata);
  }
  // TODO: Add external service tracking here (e.g., Google Analytics, Mixpanel, PostHog)
};

export const trackSearchImpression = (query: string, resultsCount: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Search Impression: "${query}" (${resultsCount} results)`);
  }
};

export const trackCalculatorRequest = (calculatorName: string, requestedBy?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Calculator Requested: ${calculatorName} by ${requestedBy || 'Anonymous'}`);
  }
};

export const trackComingSoonClick = (slug: string, source: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Coming Soon Clicked: ${slug} from ${source}`);
  }
};
