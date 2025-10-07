"use client";

import { Card } from "@/components/ui/card";

interface DNSCheckerProps {
  domain?: string;
}

export function DNSChecker({ domain }: DNSCheckerProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">
        DNS Checker para {domain || "dominio"} - Funcionalidad de verificación
        DNS aquí
      </p>
    </Card>
  );
}
