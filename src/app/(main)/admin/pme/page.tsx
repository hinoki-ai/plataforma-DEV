"use client";

import { useState, useEffect } from "react";
import { PageTransition } from "@/components/ui/page-transition";

export default function AdminPMEPage() {
  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="container mx-auto px-4 py-6">
        <div>PME Admin Page</div>
      </div>
    </PageTransition>
  );
}
