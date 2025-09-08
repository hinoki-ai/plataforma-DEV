'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ColorfulTextProps {
  text: string;
  className?: string;
  colors?: string[];
}

const defaultColors = [
  'text-pink-500',
  'text-purple-500',
  'text-indigo-500',
  'text-blue-500',
  'text-cyan-500',
  'text-teal-500',
  'text-emerald-500',
  'text-green-500',
  'text-lime-500',
  'text-yellow-500',
  'text-amber-500',
  'text-orange-500',
];

export function ColorfulText({
  text,
  className,
  colors = defaultColors,
}: ColorfulTextProps) {
  const words = text.split(' ');

  return (
    <div className={cn('flex flex-wrap gap-x-1 gap-y-0.5', className)}>
      {words.map((word, index) => (
        <span
          key={index}
          className={cn(
            'font-medium transition-all duration-300',
            colors[index % colors.length],
            'hover:brightness-110'
          )}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

// Componente específico para la descripción de la escuela
export function SchoolDescription() {
  const text =
    'Somos una escuelita de Los Sauces que recibe con cariño a niños y niñas de 3 a 6 años. Aquí los más pequeños aprenden, juegan y crecen en los cursos de Medio Mayor, Prekínder y Kínder, siempre acompañados y respetados.';

  const schoolColors = [
    'text-pink-500',
    'text-purple-500',
    'text-indigo-500',
    'text-blue-500',
    'text-cyan-500',
    'text-teal-500',
    'text-emerald-500',
    'text-green-500',
    'text-lime-500',
    'text-yellow-500',
    'text-amber-500',
    'text-orange-500',
    'text-red-500',
    'text-rose-500',
    'text-fuchsia-500',
    'text-violet-500',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ColorfulText
        text={text}
        colors={schoolColors}
        className="text-lg md:text-xl lg:text-2xl leading-relaxed justify-center"
      />
    </div>
  );
}
