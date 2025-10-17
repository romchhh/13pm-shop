"use client";

import { Suspense } from "react";

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const defaultFallback = (
  <div className="w-full h-32 bg-gray-100 animate-pulse rounded" />
);

export function LazyWrapper({ 
  fallback = defaultFallback, 
  children 
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
