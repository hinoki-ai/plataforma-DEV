"use client";

interface DomainConfigProps {
  domainStatus?: any;
}

export function DomainConfig({ domainStatus }: DomainConfigProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configuración de Google Workspace Education - Panel de configuración
        aquí
      </p>
    </div>
  );
}
