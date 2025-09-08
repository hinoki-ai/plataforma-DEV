'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { ExtendedUserRole } from '@/lib/authorization';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  rut: string;
  childName: string;
  childGrade: string;
  relationship: string;
  address: string;
  region: string;
  comuna: string;
  emergencyContact: string;
  emergencyPhone: string;
  role: 'padre' | 'madre' | 'apoderado' | 'otro';
}

const grades = [
  { value: 'prekinder', label: 'Pre-Kinder (3-4 años)' },
  { value: 'kinder', label: 'Kinder (4-5 años)' },
  { value: 'preparatoria', label: 'Preparatoria (5-6 años)' },
];

const relationships = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'apoderado', label: 'Apoderado' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'abuelo', label: 'Abuelo/a' },
  { value: 'otro', label: 'Otro' },
];

const regions = [
  { value: 'arica-parinacota', label: 'Región de Arica y Parinacota' },
  { value: 'tarapaca', label: 'Región de Tarapacá' },
  { value: 'antofagasta', label: 'Región de Antofagasta' },
  { value: 'atacama', label: 'Región de Atacama' },
  { value: 'coquimbo', label: 'Región de Coquimbo' },
  { value: 'valparaiso', label: 'Región de Valparaíso' },
  { value: 'metropolitana', label: 'Región Metropolitana de Santiago' },
  {
    value: 'ohiggins',
    label: "Región del Libertador General Bernardo O'Higgins",
  },
  { value: 'maule', label: 'Región del Maule' },
  { value: 'nuble', label: 'Región de Ñuble' },
  { value: 'biobio', label: 'Región del Biobío' },
  { value: 'araucania', label: 'Región de La Araucanía' },
  { value: 'los-rios', label: 'Región de Los Ríos' },
  { value: 'los-lagos', label: 'Región de Los Lagos' },
  {
    value: 'aysen',
    label: 'Región de Aysén del General Carlos Ibáñez del Campo',
  },
  {
    value: 'magallanes',
    label: 'Región de Magallanes y de la Antártica Chilena',
  },
];

const comunasByRegion: Record<string, string[]> = {
  'arica-parinacota': ['Arica', 'Camarones', 'General Lagos', 'Putre'],
  tarapaca: [
    'Alto Hospicio',
    'Camiña',
    'Colchane',
    'Huara',
    'Iquique',
    'Pica',
    'Pozo Almonte',
  ],
  antofagasta: [
    'Antofagasta',
    'Calama',
    'María Elena',
    'Mejillones',
    'Ollagüe',
    'San Pedro de Atacama',
    'Sierra Gorda',
    'Taltal',
    'Tocopilla',
  ],
  atacama: [
    'Alto del Carmen',
    'Caldera',
    'Chañaral',
    'Copiapó',
    'Diego de Almagro',
    'Freirina',
    'Huasco',
    'Tierra Amarilla',
    'Vallenar',
  ],
  coquimbo: [
    'Andacollo',
    'Canela',
    'Combarbalá',
    'Coquimbo',
    'Illapel',
    'La Higuera',
    'La Serena',
    'Los Vilos',
    'Monte Patria',
    'Ovalle',
    'Paihuano',
    'Punitaqui',
    'Río Hurtado',
    'Salamanca',
    'Vicuña',
  ],
  valparaiso: [
    'Algarrobo',
    'Cabildo',
    'Calle Larga',
    'Cartagena',
    'Casablanca',
    'Catemu',
    'Concón',
    'El Quisco',
    'El Tabo',
    'Hijuelas',
    'Isla de Pascua',
    'Juan Fernández',
    'La Calera',
    'La Cruz',
    'La Ligua',
    'Limache',
    'Llay-Llay',
    'Los Andes',
    'Nogales',
    'Olmué',
    'Panquehue',
    'Papudo',
    'Petorca',
    'Puchuncaví',
    'Putaendo',
    'Quillota',
    'Quilpué',
    'Quintero',
    'Rinconada',
    'San Antonio',
    'San Esteban',
    'San Felipe',
    'Santa María',
    'Santo Domingo',
    'Valparaíso',
    'Villa Alemana',
    'Viña del Mar',
    'Zapallar',
  ],
  metropolitana: [
    'Alhué',
    'Buin',
    'Calera de Tango',
    'Cerrillos',
    'Cerro Navia',
    'Colina',
    'Conchalí',
    'Curacaví',
    'El Bosque',
    'El Monte',
    'Estación Central',
    'Huechuraba',
    'Independencia',
    'Isla de Maipo',
    'La Cisterna',
    'La Florida',
    'La Granja',
    'Lampa',
    'La Pintana',
    'La Reina',
    'Las Condes',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'María Pinto',
    'Melipilla',
    'Ñuñoa',
    'Padre Hurtado',
    'Paine',
    'Peñaflor',
    'Peñalolén',
    'Pedro Aguirre Cerda',
    'Pirque',
    'Providencia',
    'Pudahuel',
    'Puente Alto',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Bernardo',
    'San Joaquín',
    'San José de Maipo',
    'San Miguel',
    'San Pedro',
    'San Ramón',
    'Santiago',
    'Talagante',
    'Til Til',
    'Vitacura',
  ],
  ohiggins: [
    'Chimbarongo',
    'Chépica',
    'Codegua',
    'Coinco',
    'Coltauco',
    'Doñihue',
    'Graneros',
    'La Estrella',
    'Las Cabras',
    'Litueche',
    'Lolol',
    'Machalí',
    'Malloa',
    'Marchihue',
    'Mostazal',
    'Nancagua',
    'Navidad',
    'Olivar',
    'Palmilla',
    'Paredones',
    'Peralillo',
    'Peumo',
    'Pichidegua',
    'Pichilemu',
    'Placilla',
    'Pumanque',
    'Quinta de Tilcoco',
    'Rancagua',
    'Rengo',
    'Requínoa',
    'San Fernando',
    'San Vicente',
    'Santa Cruz',
  ],
  maule: [
    'Cauquenes',
    'Chanco',
    'Colbún',
    'Constitución',
    'Curepto',
    'Curicó',
    'Empedrado',
    'Hualañé',
    'Licantén',
    'Linares',
    'Longaví',
    'Maule',
    'Molina',
    'Parral',
    'Pelarco',
    'Pelluhue',
    'Pencahue',
    'Rauco',
    'Retiro',
    'Río Claro',
    'Romeral',
    'Sagrada Familia',
    'San Clemente',
    'San Javier',
    'San Rafael',
    'Talca',
    'Teno',
    'Vichuquén',
    'Villa Alegre',
    'Yerbas Buenas',
  ],
  nuble: [
    'Bulnes',
    'Cobquecura',
    'Coelemu',
    'Chillán',
    'Chillán Viejo',
    'El Carmen',
    'Ninhue',
    'Ñiquén',
    'Pemuco',
    'Pinto',
    'Portezuelo',
    'Quillón',
    'Ránquil',
    'San Carlos',
    'San Fabián',
    'San Ignacio',
    'San Nicolás',
    'Treguaco',
    'Yungay',
  ],
  biobio: [
    'Alto Biobío',
    'Antuco',
    'Arauco',
    'Cabrero',
    'Cañete',
    'Chiguayante',
    'Concepción',
    'Contulmo',
    'Coronel',
    'Curanilahue',
    'Florida',
    'Hualpén',
    'Hualqui',
    'Laja',
    'Lebu',
    'Los Álamos',
    'Los Ángeles',
    'Lota',
    'Mulchén',
    'Nacimiento',
    'Negrete',
    'Penco',
    'Quilaco',
    'Quilleco',
    'San Pedro de la Paz',
    'San Rosendo',
    'Santa Bárbara',
    'Santa Juana',
    'Talcahuano',
    'Tirúa',
    'Tomé',
    'Tucapel',
    'Yumbel',
  ],
  araucania: [
    'Angol',
    'Carahue',
    'Cholchol',
    'Collipulli',
    'Cunco',
    'Curacautín',
    'Curarrehue',
    'Ercilla',
    'Freire',
    'Galvarino',
    'Gorbea',
    'Lautaro',
    'Loncoche',
    'Lonquimay',
    'Los Sauces',
    'Lumaco',
    'Melipeuco',
    'Nueva Imperial',
    'Padre Las Casas',
    'Perquenco',
    'Pitrufquén',
    'Pucón',
    'Purén',
    'Renaico',
    'Saavedra',
    'Temuco',
    'Teodoro Schmidt',
    'Toltén',
    'Traiguén',
    'Victoria',
    'Vilcún',
    'Villarrica',
  ],
  'los-rios': [
    'Corral',
    'Futrono',
    'La Unión',
    'Lago Ranco',
    'Lanco',
    'Los Lagos',
    'Máfil',
    'Mariquina',
    'Paillaco',
    'Panguipulli',
    'Río Bueno',
    'Valdivia',
  ],
  'los-lagos': [
    'Ancud',
    'Calbuco',
    'Castro',
    'Chaitén',
    'Chonchi',
    'Cochamó',
    'Curaco de Vélez',
    'Dalcahue',
    'Fresia',
    'Frutillar',
    'Futaleufú',
    'Hualaihué',
    'Llanquihue',
    'Los Muermos',
    'Maullín',
    'Osorno',
    'Palena',
    'Puerto Montt',
    'Puerto Octay',
    'Puerto Varas',
    'Puqueldón',
    'Purranque',
    'Puyehue',
    'Queilén',
    'Quellón',
    'Quemchi',
    'Quinchao',
    'Río Negro',
    'San Juan de la Costa',
    'San Pablo',
  ],
  aysen: [
    'Aysén',
    'Chile Chico',
    'Cisnes',
    'Cochrane',
    'Coyhaique',
    'Guaitecas',
    'Lago Verde',
    "O'Higgins",
    'Río Ibáñez',
    'Tortel',
  ],
  magallanes: [
    'Antártica',
    'Cabo de Hornos',
    'Laguna Blanca',
    'Natales',
    'Porvenir',
    'Primavera',
    'Punta Arenas',
    'Río Verde',
    'San Gregorio',
    'Timaukel',
    'Torres del Paine',
  ],
};

const stepTitles = [
  'Información Personal',
  'Datos del Estudiante',
  'Ubicación',
  'Contacto de Emergencia',
];

const stepDescriptions = [
  'Tus datos básicos de contacto',
  'Datos de tu hijo/a que asiste a Manitos Pintadas',
  'Tu dirección y ubicación',
  'Persona a contactar en caso de emergencia',
];

export const UnifiedSignupForm = memo(function UnifiedSignupForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    rut: '',
    childName: '',
    childGrade: '',
    relationship: '',
    address: '',
    region: '',
    comuna: '',
    emergencyContact: '',
    emergencyPhone: '',
    role: 'padre',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [comunas, setComunas] = useState<string[]>([]);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const router = useRouter();

  // Pre-fill form data for Google users
  useEffect(() => {
    if (
      session?.user &&
      session.user.role === 'PARENT' &&
      session.user.needsRegistration
    ) {
      setIsGoogleUser(true);
      setFormData(prev => ({
        ...prev,
        fullName: session.user?.name || '',
        email: session.user?.email || '',
      }));
    }
  }, [session]);

  // Update comunas when region changes
  useEffect(() => {
    if (formData.region) {
      setComunas(comunasByRegion[formData.region] || []);
      setFormData(prev => ({ ...prev, comuna: '' }));
    }
  }, [formData.region]);

  // Check Google OAuth configuration
  useEffect(() => {
    fetch('/api/auth/oauth-status')
      .then(res => res.json())
      .then(data => setIsGoogleConfigured(data.google.enabled))
      .catch(() => setIsGoogleConfigured(false));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    },
    []
  );

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Partial<FormData> = {};

      switch (step) {
        case 1:
          if (!formData.fullName.trim())
            newErrors.fullName = 'El nombre completo es requerido';
          if (!formData.email.trim()) newErrors.email = 'El email es requerido';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
          }
          if (!formData.phone.trim())
            newErrors.phone = 'El teléfono es requerido';
          if (!formData.rut.trim()) newErrors.rut = 'El RUT es requerido';
          break;

        case 2:
          if (!formData.childName.trim())
            newErrors.childName = 'El nombre del niño/a es requerido';
          if (!formData.childGrade)
            newErrors.childGrade = 'El grado es requerido';
          if (!formData.relationship)
            newErrors.relationship = 'La relación es requerida';
          break;

        case 3:
          if (!formData.address.trim())
            newErrors.address = 'La dirección es requerida';
          if (!formData.region) newErrors.region = 'La región es requerida';
          if (!formData.comuna) newErrors.comuna = 'La comuna es requerida';
          break;

        case 4:
          if (!formData.emergencyContact.trim()) {
            newErrors.emergencyContact =
              'El contacto de emergencia es requerido';
          }
          if (!formData.emergencyPhone.trim()) {
            newErrors.emergencyPhone = 'El teléfono de emergencia es requerido';
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateStep(4)) return;

      setIsLoading(true);
      try {
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          form.append(key, value);
        });

        if (isGoogleUser && session?.user?.provider) {
          form.append('provider', session.user.provider);
          form.append('providerUserId', session.user.id || '');
        }

        const response = await fetch('/api/parent/register', {
          method: 'POST',
          body: form,
        });
        const result = await response.json();

        if (result.success) {
          router.push('/centro-consejo/exito');
        } else {
          setErrors({ email: result.error || 'Error en el registro' });
        }
      } catch {
        setErrors({
          email: 'Error interno del servidor. Por favor, intenta nuevamente.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, isGoogleUser, session, router, validateStep]
  );

  const handleGoogleLogin = useCallback(() => {
    setIsLoading(true);
    signIn('google', {
      callbackUrl: '/centro-consejo/exito',
      redirect: true,
    }).catch(() => setIsLoading(false));
  }, []);

  const StepIndicator = memo(function StepIndicator() {
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                currentStep >= step
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/50 scale-110'
                  : 'bg-gray-700 text-gray-400'
              )}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={cn(
                  'w-12 h-1 mx-2 transition-all duration-300',
                  currentStep > step
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
                    : 'bg-gray-700'
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  });

  const renderStep = () => {
    const stepVariants = {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {stepTitles[0]}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {stepDescriptions[0]}
                </p>
              </div>

              <div className="space-y-4">
                <LabelInputContainer>
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Juan Pérez González"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={cn(
                      'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500',
                      errors.fullName && 'border-red-500'
                    )}
                  />
                  {errors.fullName && (
                    <ErrorMessage message={errors.fullName} />
                  )}
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isGoogleUser}
                    className={cn(
                      'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500',
                      errors.email && 'border-red-500'
                    )}
                  />
                  {errors.email && <ErrorMessage message={errors.email} />}
                </LabelInputContainer>

                <div className="grid md:grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={formData.phone}
                      onChange={handleChange}
                      className={cn(
                        'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500',
                        errors.phone && 'border-red-500'
                      )}
                    />
                    {errors.phone && <ErrorMessage message={errors.phone} />}
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="rut">RUT *</Label>
                    <Input
                      id="rut"
                      name="rut"
                      placeholder="12.345.678-9"
                      value={formData.rut}
                      onChange={handleChange}
                      className={cn(
                        'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500',
                        errors.rut && 'border-red-500'
                      )}
                    />
                    {errors.rut && <ErrorMessage message={errors.rut} />}
                  </LabelInputContainer>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {stepTitles[1]}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {stepDescriptions[1]}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="childName">Nombre del Niño/a *</Label>
                    <Input
                      id="childName"
                      name="childName"
                      placeholder="María José"
                      value={formData.childName}
                      onChange={handleChange}
                      className={cn(
                        'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500',
                        errors.childName && 'border-red-500'
                      )}
                    />
                    {errors.childName && (
                      <ErrorMessage message={errors.childName} />
                    )}
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="childGrade">Grado *</Label>
                    <Select
                      id="childGrade"
                      name="childGrade"
                      value={formData.childGrade}
                      onChange={handleChange}
                      error={errors.childGrade}
                    >
                      <option value="">Selecciona un grado</option>
                      {grades.map(grade => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </Select>
                    {errors.childGrade && (
                      <ErrorMessage message={errors.childGrade} />
                    )}
                  </LabelInputContainer>
                </div>

                <LabelInputContainer>
                  <Label htmlFor="relationship">Relación con el niño/a *</Label>
                  <Select
                    id="relationship"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    error={errors.relationship}
                  >
                    <option value="">Selecciona relación</option>
                    {relationships.map(rel => (
                      <option key={rel.value} value={rel.value}>
                        {rel.label}
                      </option>
                    ))}
                  </Select>
                  {errors.relationship && (
                    <ErrorMessage message={errors.relationship} />
                  )}
                </LabelInputContainer>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {stepTitles[2]}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {stepDescriptions[2]}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="region">Región *</Label>
                    <Select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      error={errors.region}
                    >
                      <option value="">Selecciona región</option>
                      {regions.map(region => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </Select>
                    {errors.region && <ErrorMessage message={errors.region} />}
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="comuna">Comuna *</Label>
                    <Select
                      id="comuna"
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleChange}
                      error={errors.comuna}
                      disabled={!formData.region}
                    >
                      <option value="">Selecciona comuna</option>
                      {comunas.map(comuna => (
                        <option key={comuna} value={comuna}>
                          {comuna}
                        </option>
                      ))}
                    </Select>
                    {errors.comuna && <ErrorMessage message={errors.comuna} />}
                  </LabelInputContainer>
                </div>

                <LabelInputContainer>
                  <Label htmlFor="address">Dirección Completa *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Av. Principal 123, Comuna"
                    value={formData.address}
                    onChange={handleChange}
                    className={cn(
                      'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500',
                      errors.address && 'border-red-500'
                    )}
                  />
                  {errors.address && <ErrorMessage message={errors.address} />}
                </LabelInputContainer>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {stepTitles[3]}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {stepDescriptions[3]}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="emergencyContact">
                      Nombre de Contacto *
                    </Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      placeholder="Nombre de contacto"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className={cn(
                        'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500',
                        errors.emergencyContact && 'border-red-500'
                      )}
                    />
                    {errors.emergencyContact && (
                      <ErrorMessage message={errors.emergencyContact} />
                    )}
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="emergencyPhone">
                      Teléfono Emergencia *
                    </Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className={cn(
                        'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500',
                        errors.emergencyPhone && 'border-red-500'
                      )}
                    />
                    {errors.emergencyPhone && (
                      <ErrorMessage message={errors.emergencyPhone} />
                    )}
                  </LabelInputContainer>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 p-6 text-white">
          <h2 className="font-bold text-2xl mb-2">
            {isGoogleUser
              ? 'Completa tu Registro'
              : 'Registro Centro y Consejo'}
          </h2>
          <p className="text-blue-100">
            Paso {currentStep} de 4: {stepTitles[currentStep - 1]}
          </p>
        </div>

        <div className="p-8">
          <StepIndicator />

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}

            <div className="flex justify-between items-center pt-6 border-t border-gray-700/50">
              <Button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors border border-gray-600"
              >
                Anterior
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? 'Registrando...' : 'Completar Registro'}
                </Button>
              )}
            </div>
          </form>

          {/* OAuth Section - Only show for non-Google users */}
          {!isGoogleUser && (
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-900/80 px-4 text-gray-400">
                    O continúa con
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || !isGoogleConfigured}
                className="relative group flex space-x-3 items-center justify-center px-6 w-full text-gray-200 rounded-lg h-12 font-medium shadow-lg bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-base font-semibold">
                  {!isGoogleConfigured
                    ? 'Google (No disponible)'
                    : 'Registrarse con Google'}
                </span>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});

// Helper Components
const LabelInputContainer = memo(function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col space-y-2 w-full', className)}>
      {children}
    </div>
  );
});

const Select = memo(function Select({
  children,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select
      {...props}
      className={cn(
        'block w-full px-3 py-2 border rounded-md text-sm',
        'placeholder:text-gray-500 focus:outline-none focus:ring-2',
        'focus:ring-blue-500 focus:border-transparent transition-colors',
        'bg-gray-800 border-gray-600 text-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed',
        error && 'border-red-500'
      )}
    >
      {children}
    </select>
  );
});

const ErrorMessage = memo(function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <p className="text-red-400 text-xs mt-1 animate-in fade-in duration-200">
      {message}
    </p>
  );
});

// Display name for debugging
UnifiedSignupForm.displayName = 'UnifiedSignupForm';
