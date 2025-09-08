/**
 * 🏛️ Institution Configuration Card
 * Master admin card for educational institution settings
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  School, 
  GraduationCap, 
  BookOpen,
  Building2,
  ChevronRight,
  Cog
} from 'lucide-react';
import { 
  EducationalInstitutionType, 
  INSTITUTION_TYPE_INFO
} from '@/lib/educational-system';

interface InstitutionConfigCardProps {
  currentType: EducationalInstitutionType;
  onConfigureClick: () => void;
}

export function InstitutionConfigCard({ 
  currentType, 
  onConfigureClick 
}: InstitutionConfigCardProps) {
  const currentInfo = INSTITUTION_TYPE_INFO[currentType];

  const getInstitutionIcon = (type: EducationalInstitutionType) => {
    switch (type) {
      case 'PRESCHOOL': return <School className="h-8 w-8" />;
      case 'BASIC_SCHOOL': return <BookOpen className="h-8 w-8" />;
      case 'HIGH_SCHOOL': return <GraduationCap className="h-8 w-8" />;
      case 'COLLEGE': return <Building2 className="h-8 w-8" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-950/20 dark:to-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              {getInstitutionIcon(currentType)}
            </div>
            <div>
              <CardTitle className="text-xl">
                {currentInfo.icon} {currentInfo.chileanName}
              </CardTitle>
              <CardDescription className="text-base">
                Configuración actual del sistema educativo
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={onConfigureClick}
            className="gap-2"
            variant="outline"
          >
            <Cog className="h-4 w-4" />
            Configurar
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tipo de Institución</h4>
            <Badge className={currentInfo.color} variant="secondary">
              {currentInfo.name}
            </Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {currentInfo.description}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Niveles Disponibles</h4>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentInfo.levels.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Niveles educativos configurados
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Rango de Edades</h4>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {currentInfo.levels[0]?.ages} - {currentInfo.levels[currentInfo.levels.length - 1]?.ages}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cobertura educativa completa
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}