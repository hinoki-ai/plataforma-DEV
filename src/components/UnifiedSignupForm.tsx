"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSignIn } from "@clerk/nextjs";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useStepNavigation } from "@/lib/hooks/useFocusManagement";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { validateRUT } from "@/lib/rut-utils";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  rut: string;
  password: string;
  confirmPassword: string;
  childName: string;
  childRUT: string;
  childPhone: string;
  childGrade: string;
  relationship: string;
  customRelationship: string;
  address: string;
  region: string;
  comuna: string;
  emergencyContact: string;
  emergencyPhone: string;
  secondaryEmergencyContact: string;
  secondaryEmergencyPhone: string;
  tertiaryEmergencyContact: string;
  tertiaryEmergencyPhone: string;
  role: "padre" | "madre" | "apoderado" | "otro";
  institutionId: string;
}

const getGrades = (t: (key: string) => string) => [
  // Pre-school
  { value: "sala_cuna_menor", label: t("grade.sala_cuna_menor") },
  { value: "sala_cuna_mayor", label: t("grade.sala_cuna_mayor") },
  { value: "nivel_medio_menor", label: t("grade.nivel_medio_menor") },
  { value: "nivel_medio_mayor", label: t("grade.nivel_medio_mayor") },
  { value: "prekinder", label: t("grade.prekinder") },
  { value: "kinder", label: t("grade.kinder") },

  // Basic School
  { value: "primer_basico", label: t("grade.primer_basico") },
  { value: "segundo_basico", label: t("grade.segundo_basico") },
  { value: "tercero_basico", label: t("grade.tercero_basico") },
  { value: "cuarto_basico", label: t("grade.cuarto_basico") },
  { value: "quinto_basico", label: t("grade.quinto_basico") },
  { value: "sexto_basico", label: t("grade.sexto_basico") },
  { value: "septimo_basico", label: t("grade.septimo_basico") },
  { value: "octavo_basico", label: t("grade.octavo_basico") },

  // High School
  { value: "primer_medio", label: t("grade.primer_medio") },
  { value: "segundo_medio", label: t("grade.segundo_medio") },
  { value: "tercero_medio", label: t("grade.tercero_medio") },
  { value: "cuarto_medio", label: t("grade.cuarto_medio") },

  // Higher Education
  { value: "tecnico_1ano", label: t("grade.tecnico_1ano") },
  { value: "tecnico_2ano", label: t("grade.tecnico_2ano") },
  { value: "tecnico_3ano", label: t("grade.tecnico_3ano") },
  { value: "licenciatura_1ano", label: t("grade.licenciatura_1ano") },
  { value: "licenciatura_2ano", label: t("grade.licenciatura_2ano") },
  { value: "licenciatura_3ano", label: t("grade.licenciatura_3ano") },
  { value: "licenciatura_4ano", label: t("grade.licenciatura_4ano") },
  {
    value: "titulo_profesional_1ano",
    label: t("grade.titulo_profesional_1ano"),
  },
  {
    value: "titulo_profesional_2ano",
    label: t("grade.titulo_profesional_2ano"),
  },
  {
    value: "titulo_profesional_3ano",
    label: t("grade.titulo_profesional_3ano"),
  },
  {
    value: "titulo_profesional_4ano",
    label: t("grade.titulo_profesional_4ano"),
  },
  {
    value: "titulo_profesional_5ano",
    label: t("grade.titulo_profesional_5ano"),
  },
  {
    value: "titulo_profesional_6ano",
    label: t("grade.titulo_profesional_6ano"),
  },
  { value: "magister_1ano", label: t("grade.magister_1ano") },
  { value: "magister_2ano", label: t("grade.magister_2ano") },
  { value: "doctorado_1ano", label: t("grade.doctorado_1ano") },
  { value: "doctorado_2ano", label: t("grade.doctorado_2ano") },
  { value: "doctorado_3ano", label: t("grade.doctorado_3ano") },
  { value: "doctorado_4ano", label: t("grade.doctorado_4ano") },
];

const getRelationships = (t: (key: string) => string) => [
  { value: "padre", label: t("relationship.padre") },
  { value: "madre", label: t("relationship.madre") },
  { value: "apoderado", label: t("relationship.apoderado") },
  { value: "tutor", label: t("relationship.tutor") },
  { value: "abuelo", label: t("relationship.abuelo") },
  { value: "otro", label: t("relationship.otro") },
];

const getRegions = (t: (key: string) => string) => [
  { value: "arica-parinacota", label: t("region.arica-parinacota") },
  { value: "tarapaca", label: t("region.tarapaca") },
  { value: "antofagasta", label: t("region.antofagasta") },
  { value: "atacama", label: t("region.atacama") },
  { value: "coquimbo", label: t("region.coquimbo") },
  { value: "valparaiso", label: t("region.valparaiso") },
  { value: "metropolitana", label: t("region.metropolitana") },
  {
    value: "ohiggins",
    label: t("region.ohiggins"),
  },
  { value: "maule", label: t("region.maule") },
  { value: "nuble", label: t("region.nuble") },
  { value: "biobio", label: t("region.biobio") },
  { value: "araucania", label: t("region.araucania") },
  { value: "los-rios", label: t("region.los-rios") },
  { value: "los-lagos", label: t("region.los-lagos") },
  {
    value: "aysen",
    label: t("region.aysen"),
  },
  {
    value: "magallanes",
    label: t("region.magallanes"),
  },
];

const comunasByRegion: Record<string, string[]> = {
  "arica-parinacota": ["Arica", "Camarones", "General Lagos", "Putre"],
  tarapaca: [
    "Alto Hospicio",
    "Camiña",
    "Colchane",
    "Huara",
    "Iquique",
    "Pica",
    "Pozo Almonte",
  ],
  antofagasta: [
    "Antofagasta",
    "Calama",
    "María Elena",
    "Mejillones",
    "Ollagüe",
    "San Pedro de Atacama",
    "Sierra Gorda",
    "Taltal",
    "Tocopilla",
  ],
  atacama: [
    "Alto del Carmen",
    "Caldera",
    "Chañaral",
    "Copiapó",
    "Diego de Almagro",
    "Freirina",
    "Huasco",
    "Tierra Amarilla",
    "Vallenar",
  ],
  coquimbo: [
    "Andacollo",
    "Canela",
    "Combarbalá",
    "Coquimbo",
    "Illapel",
    "La Higuera",
    "La Serena",
    "Los Vilos",
    "Monte Patria",
    "Ovalle",
    "Paihuano",
    "Punitaqui",
    "Río Hurtado",
    "Salamanca",
    "Vicuña",
  ],
  valparaiso: [
    "Algarrobo",
    "Cabildo",
    "Calle Larga",
    "Cartagena",
    "Casablanca",
    "Catemu",
    "Concón",
    "El Quisco",
    "El Tabo",
    "Hijuelas",
    "Isla de Pascua",
    "Juan Fernández",
    "La Calera",
    "La Cruz",
    "La Ligua",
    "Limache",
    "Llay-Llay",
    "Los Andes",
    "Nogales",
    "Olmué",
    "Panquehue",
    "Papudo",
    "Petorca",
    "Puchuncaví",
    "Putaendo",
    "Quillota",
    "Quilpué",
    "Quintero",
    "Rinconada",
    "San Antonio",
    "San Esteban",
    "San Felipe",
    "Santa María",
    "Santo Domingo",
    "Valparaíso",
    "Villa Alemana",
    "Viña del Mar",
    "Zapallar",
  ],
  metropolitana: [
    "Alhué",
    "Buin",
    "Calera de Tango",
    "Cerrillos",
    "Cerro Navia",
    "Colina",
    "Conchalí",
    "Curacaví",
    "El Bosque",
    "El Monte",
    "Estación Central",
    "Huechuraba",
    "Independencia",
    "Isla de Maipo",
    "La Cisterna",
    "La Florida",
    "La Granja",
    "Lampa",
    "La Pintana",
    "La Reina",
    "Las Condes",
    "Lo Barnechea",
    "Lo Espejo",
    "Lo Prado",
    "Macul",
    "Maipú",
    "María Pinto",
    "Melipilla",
    "Ñuñoa",
    "Padre Hurtado",
    "Paine",
    "Peñaflor",
    "Peñalolén",
    "Pedro Aguirre Cerda",
    "Pirque",
    "Providencia",
    "Pudahuel",
    "Puente Alto",
    "Quilicura",
    "Quinta Normal",
    "Recoleta",
    "Renca",
    "San Bernardo",
    "San Joaquín",
    "San José de Maipo",
    "San Miguel",
    "San Pedro",
    "San Ramón",
    "Santiago",
    "Talagante",
    "Til Til",
    "Vitacura",
  ],
  ohiggins: [
    "Chimbarongo",
    "Chépica",
    "Codegua",
    "Coinco",
    "Coltauco",
    "Doñihue",
    "Graneros",
    "La Estrella",
    "Las Cabras",
    "Litueche",
    "Lolol",
    "Machalí",
    "Malloa",
    "Marchihue",
    "Mostazal",
    "Nancagua",
    "Navidad",
    "Olivar",
    "Palmilla",
    "Paredones",
    "Peralillo",
    "Peumo",
    "Pichidegua",
    "Pichilemu",
    "Placilla",
    "Pumanque",
    "Quinta de Tilcoco",
    "Rancagua",
    "Rengo",
    "Requínoa",
    "San Fernando",
    "San Vicente",
    "Santa Cruz",
  ],
  maule: [
    "Cauquenes",
    "Chanco",
    "Colbún",
    "Constitución",
    "Curepto",
    "Curicó",
    "Empedrado",
    "Hualañé",
    "Licantén",
    "Linares",
    "Longaví",
    "Maule",
    "Molina",
    "Parral",
    "Pelarco",
    "Pelluhue",
    "Pencahue",
    "Rauco",
    "Retiro",
    "Río Claro",
    "Romeral",
    "Sagrada Familia",
    "San Clemente",
    "San Javier",
    "San Rafael",
    "Talca",
    "Teno",
    "Vichuquén",
    "Villa Alegre",
    "Yerbas Buenas",
  ],
  nuble: [
    "Bulnes",
    "Chillán",
    "Chillán Viejo",
    "Cobquecura",
    "Coelemu",
    "Coihueco",
    "El Carmen",
    "Ninhue",
    "Ñiquén",
    "Pemuco",
    "Pinto",
    "Portezuelo",
    "Quillón",
    "Quirihue",
    "Ránquil",
    "San Carlos",
    "San Fabián",
    "San Ignacio",
    "San Nicolás",
    "Treguaco",
    "Yungay",
  ],
  biobio: [
    "Alto Biobío",
    "Antuco",
    "Arauco",
    "Cabrero",
    "Cañete",
    "Chiguayante",
    "Concepción",
    "Contulmo",
    "Coronel",
    "Curanilahue",
    "Florida",
    "Hualpén",
    "Hualqui",
    "Laja",
    "Lebu",
    "Los Álamos",
    "Los Ángeles",
    "Lota",
    "Mulchén",
    "Nacimiento",
    "Negrete",
    "Penco",
    "Quilaco",
    "Quilleco",
    "San Pedro de la Paz",
    "San Rosendo",
    "Santa Bárbara",
    "Santa Juana",
    "Talcahuano",
    "Tirúa",
    "Tomé",
    "Tucapel",
    "Yumbel",
  ],
  araucania: [
    "Angol",
    "Carahue",
    "Cholchol",
    "Collipulli",
    "Cunco",
    "Curacautín",
    "Curarrehue",
    "Ercilla",
    "Freire",
    "Galvarino",
    "Gorbea",
    "Lautaro",
    "Loncoche",
    "Lonquimay",
    "Los Sauces",
    "Lumaco",
    "Melipeuco",
    "Nueva Imperial",
    "Padre Las Casas",
    "Perquenco",
    "Pitrufquén",
    "Pucón",
    "Purén",
    "Renaico",
    "Saavedra",
    "Temuco",
    "Teodoro Schmidt",
    "Toltén",
    "Traiguén",
    "Victoria",
    "Vilcún",
    "Villarrica",
  ],
  "los-rios": [
    "Corral",
    "Futrono",
    "La Unión",
    "Lago Ranco",
    "Lanco",
    "Los Lagos",
    "Máfil",
    "Mariquina",
    "Paillaco",
    "Panguipulli",
    "Río Bueno",
    "Valdivia",
  ],
  "los-lagos": [
    "Ancud",
    "Calbuco",
    "Castro",
    "Chaitén",
    "Chonchi",
    "Cochamó",
    "Curaco de Vélez",
    "Dalcahue",
    "Fresia",
    "Frutillar",
    "Futaleufú",
    "Hualaihué",
    "Llanquihue",
    "Los Muermos",
    "Maullín",
    "Osorno",
    "Palena",
    "Puerto Montt",
    "Puerto Octay",
    "Puerto Varas",
    "Puqueldón",
    "Purranque",
    "Puyehue",
    "Queilén",
    "Quellón",
    "Quemchi",
    "Quinchao",
    "Río Negro",
    "San Juan de la Costa",
    "San Pablo",
  ],
  aysen: [
    "Aysén",
    "Chile Chico",
    "Cisnes",
    "Cochrane",
    "Coyhaique",
    "Guaitecas",
    "Lago Verde",
    "O'Higgins",
    "Río Ibáñez",
    "Tortel",
  ],
  magallanes: [
    "Antártica",
    "Cabo de Hornos",
    "Laguna Blanca",
    "Natales",
    "Porvenir",
    "Primavera",
    "Punta Arenas",
    "Río Verde",
    "San Gregorio",
    "Timaukel",
    "Torres del Paine",
  ],
};

const getStepTitles = (t: (key: string) => string) => [
  t("signup.step1.title"),
  t("signup.step2.title"),
  t("signup.step3.title"),
  t("signup.step4.title"),
];

const getStepDescriptions = (t: (key: string) => string) => [
  t("signup.step1.description"),
  t("signup.step2.description"),
  t("signup.step3.description"),
  t("signup.step4.description"),
];

export const UnifiedSignupForm = memo(function UnifiedSignupForm() {
  const { data: session } = useSession();
  const { signIn: clerkSignIn } = useSignIn();
  const { t } = useDivineParsing(["common"]);

  const stepTitles = getStepTitles(t);
  const stepDescriptions = getStepDescriptions(t);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    rut: "",
    password: "",
    confirmPassword: "",
    childName: "",
    childRUT: "",
    childPhone: "",
    childGrade: "",
    relationship: "",
    customRelationship: "",
    address: "",
    region: "",
    comuna: "",
    emergencyContact: "",
    emergencyPhone: "",
    secondaryEmergencyContact: "",
    secondaryEmergencyPhone: "",
    tertiaryEmergencyContact: "",
    tertiaryEmergencyPhone: "",
    role: "padre",
    institutionId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = stepTitles.length;
  const [comunas, setComunas] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [institutionPopoverOpen, setInstitutionPopoverOpen] = useState(false);
  const router = useRouter();

  // Field navigation for Enter key functionality
  const getFieldOrderForStep = useCallback(
    (step: number): string[] => {
      const fieldSequences = {
        1: ["email", "password", "confirmPassword"],
        2: [
          "fullName",
          "childName",
          "rut",
          "childRUT",
          "phone",
          "childPhone",
          "relationship",
          "customRelationship",
        ],
        3: ["region", "comuna", "address", "institutionId", "childGrade"],
        4: [
          "emergencyContact",
          "emergencyPhone",
          "secondaryEmergencyContact",
          "secondaryEmergencyPhone",
          "tertiaryEmergencyContact",
          "tertiaryEmergencyPhone",
        ],
      };

      const sequence =
        fieldSequences[step as keyof typeof fieldSequences] || [];
      // Filter out customRelationship if not needed
      if (step === 2 && formData.relationship !== "otro") {
        return sequence.filter((field) => field !== "customRelationship");
      }
      return sequence;
    },
    [formData.relationship],
  );

  // Custom handler for institution popover
  const handleInstitutionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setInstitutionPopoverOpen(true);
        // Focus the command input inside the popover after a short delay
        setTimeout(() => {
          const commandInput = document.querySelector(
            "[data-radix-collection-item] input",
          ) as HTMLInputElement;
          if (commandInput) {
            commandInput.focus();
          }
        }, 100);
      }
    },
    [],
  );

  // Pre-fill form data for Google users
  useEffect(() => {
    if (
      session?.user &&
      session.user.role === "PARENT" &&
      session.user.needsRegistration
    ) {
      setIsGoogleUser(true);
      setFormData((prev) => ({
        ...prev,
        fullName: session.user?.name || "",
        email: session.user?.email || "",
      }));
    }
  }, [session]);

  // Update comunas when region changes
  useEffect(() => {
    if (formData.region) {
      setComunas(comunasByRegion[formData.region] || []);
      setFormData((prev) => ({ ...prev, comuna: "" }));
    }
  }, [formData.region]);

  // Fetch institutions
  useEffect(() => {
    fetch("/api/institutions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.institutions) {
          setInstitutions(data.institutions);
        }
      })
      .catch((error) => {
        console.error("Error fetching institutions:", error);
      });
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [],
  );

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Partial<FormData> = {};

      switch (step) {
        case 1:
          if (!formData.email.trim())
            newErrors.email = t("validation.email_required");
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("validation.email_invalid");
          }
          if (!formData.password.trim())
            newErrors.password = t("validation.password_required");
          if (formData.password.length < 8)
            newErrors.password = t("validation.password_min_length");
          if (!/^(?=.*\d).{8,}$/.test(formData.password)) {
            newErrors.password = t("validation.password_requirements");
          }
          if (!formData.confirmPassword.trim())
            newErrors.confirmPassword = t(
              "validation.confirm_password_required",
            );
          if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = t("validation.passwords_mismatch");
          break;

        case 2:
          if (!formData.fullName.trim())
            newErrors.fullName = t("validation.full_name_required");
          if (!formData.phone.trim())
            newErrors.phone = t("validation.phone_required");
          if (!formData.rut.trim())
            newErrors.rut = t("validation.rut_required");
          else {
            const rutValidation = validateRUT(formData.rut);
            if (!rutValidation.valid) {
              newErrors.rut =
                rutValidation.error || t("validation.rut_invalid");
            }
          }
          if (!formData.childName.trim())
            newErrors.childName = t("validation.child_name_required");
          if (!formData.childRUT.trim())
            newErrors.childRUT = t("validation.child_rut_required");
          else {
            const childRutValidation = validateRUT(formData.childRUT);
            if (!childRutValidation.valid) {
              newErrors.childRUT =
                childRutValidation.error || t("validation.rut_invalid");
            }
          }
          if (!formData.childPhone.trim())
            newErrors.childPhone = t("validation.child_phone_required");
          if (!formData.relationship)
            newErrors.relationship = t("validation.relationship_required");
          if (
            formData.relationship === "otro" &&
            !formData.customRelationship.trim()
          )
            newErrors.customRelationship = t(
              "validation.custom_relationship_required",
            );
          break;

        case 3:
          if (!formData.address.trim())
            newErrors.address = t("validation.address_required");
          if (!formData.region)
            newErrors.region = t("validation.region_required");
          if (!formData.comuna)
            newErrors.comuna = t("validation.comuna_required");
          if (!formData.institutionId)
            newErrors.institutionId = t("validation.institution_required");
          if (!formData.childGrade)
            newErrors.childGrade = t("validation.grade_required");
          break;

        case 4:
          if (!formData.emergencyContact.trim()) {
            newErrors.emergencyContact = t(
              "validation.emergency_contact_required",
            );
          }
          if (!formData.emergencyPhone.trim()) {
            newErrors.emergencyPhone = t("validation.emergency_phone_required");
          }
          // Secondary emergency contact is optional but if provided, phone is required
          if (
            formData.secondaryEmergencyContact.trim() &&
            !formData.secondaryEmergencyPhone.trim()
          ) {
            newErrors.secondaryEmergencyPhone = t(
              "validation.secondary_emergency_phone_required",
            );
          }
          if (
            formData.secondaryEmergencyPhone.trim() &&
            !formData.secondaryEmergencyContact.trim()
          ) {
            newErrors.secondaryEmergencyContact = t(
              "validation.secondary_emergency_contact_required",
            );
          }
          // Tertiary emergency contact is optional but if provided, phone is required
          if (
            formData.tertiaryEmergencyContact.trim() &&
            !formData.tertiaryEmergencyPhone.trim()
          ) {
            newErrors.tertiaryEmergencyPhone = t(
              "validation.tertiary_emergency_phone_required",
            );
          }
          if (
            formData.tertiaryEmergencyPhone.trim() &&
            !formData.tertiaryEmergencyContact.trim()
          ) {
            newErrors.tertiaryEmergencyContact = t(
              "validation.tertiary_emergency_contact_required",
            );
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData],
  );

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  }, [currentStep, validateStep, totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Step-based Enter key navigation
  const { handleKeyDown } = useStepNavigation(
    getFieldOrderForStep,
    currentStep,
    totalSteps,
    nextStep,
    () => handleSubmit({} as any),
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateStep(totalSteps)) return;

      setIsLoading(true);
      try {
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          // Skip confirmPassword as it's not needed in the API
          // For relationship, use customRelationship if "otro" is selected
          if (key === "relationship") {
            const relationshipValue =
              value === "otro" && formData.customRelationship.trim()
                ? formData.customRelationship.trim()
                : value;
            form.append(key, relationshipValue);
          } else if (
            key !== "confirmPassword" &&
            key !== "customRelationship"
          ) {
            form.append(key, value);
          }
        });

        if (isGoogleUser && session?.user?.provider) {
          form.append("provider", session.user.provider);
          form.append("providerUserId", session.user.id || "");
        }

        const response = await fetch("/api/parent/register", {
          method: "POST",
          body: form,
        });
        const result = await response.json();

        if (result.success) {
          router.push("/cpma/exito");
        } else {
          setErrors({ email: result.error || "Error en el registro" });
        }
      } catch {
        setErrors({
          email: t("signup.server_error"),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, isGoogleUser, session, router, validateStep, totalSteps],
  );

  const handleGoogleLogin = useCallback(() => {
    setIsLoading(true);
    if (clerkSignIn) {
      void clerkSignIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/cpma/exito",
        redirectUrlComplete: "/cpma/exito",
      });
    }
  }, [clerkSignIn]);

  const StepIndicator = memo(function StepIndicator() {
    return (
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, index) => index + 1).map(
          (step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                  currentStep >= step
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110 border-primary"
                    : "bg-muted text-muted-foreground border-muted-foreground/30",
                )}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    "w-12 h-1 mx-2 transition-all duration-300 rounded-full",
                    currentStep > step ? "bg-primary shadow-sm" : "bg-muted",
                  )}
                />
              )}
            </div>
          ),
        )}
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
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {stepTitles[0]}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {stepDescriptions[0]}
                </p>
              </div>

              <div className="space-y-4">
                <LabelInputContainer>
                  <Label htmlFor="email">{t("signup.email.label")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, "email")}
                    disabled={isGoogleUser}
                    className={cn(
                      "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:cursor-not-allowed",
                      errors.email &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    )}
                  />
                  {errors.email && <ErrorMessage message={errors.email} />}
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="password">{t("signup.password.label")}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, "password")}
                    className={cn(
                      "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                      errors.password &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("signup.password.hint")}
                  </p>
                  {errors.password && (
                    <ErrorMessage message={errors.password} />
                  )}
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="confirmPassword">
                    {t("signup.confirm_password.label")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, "confirmPassword")}
                    className={cn(
                      "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                      errors.confirmPassword &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    )}
                  />
                  {errors.confirmPassword && (
                    <ErrorMessage message={errors.confirmPassword} />
                  )}
                </LabelInputContainer>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {stepTitles[1]}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {stepDescriptions[1]}
                </p>
              </div>

              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground">
                    {t("signup.personal_section.title")}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <LabelInputContainer>
                      <Label htmlFor="fullName">
                        {t("signup.full_name.label")}
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Juan Pérez González"
                        value={formData.fullName}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, "fullName")}
                        className={cn(
                          "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.fullName &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        )}
                      />
                      {errors.fullName && (
                        <ErrorMessage message={errors.fullName} />
                      )}
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="childName">
                        {t("signup.child_name.label")}
                      </Label>
                      <Input
                        id="childName"
                        name="childName"
                        placeholder="María José"
                        value={formData.childName}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, "childName")}
                        className={cn(
                          "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.childName &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        )}
                      />
                      {errors.childName && (
                        <ErrorMessage message={errors.childName} />
                      )}
                    </LabelInputContainer>
                  </div>
                </div>

                {/* Identification Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground">
                    {t("signup.identification_section.title")}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <LabelInputContainer>
                      <Label htmlFor="rut">{t("signup.rut.label")}</Label>
                      <Input
                        id="rut"
                        name="rut"
                        placeholder="12.345.678-9"
                        value={formData.rut}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, "rut")}
                        className={cn(
                          "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.rut &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        )}
                      />
                      {errors.rut && <ErrorMessage message={errors.rut} />}
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="childRUT">
                        {t("signup.child_rut.label")}
                      </Label>
                      <Input
                        id="childRUT"
                        name="childRUT"
                        placeholder="12.345.678-9"
                        value={formData.childRUT}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, "childRUT")}
                        className={cn(
                          "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.childRUT &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        )}
                      />
                      {errors.childRUT && (
                        <ErrorMessage message={errors.childRUT} />
                      )}
                    </LabelInputContainer>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground">
                    {t("signup.contact_section.title")}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <LabelInputContainer>
                      <Label htmlFor="phone">{t("signup.phone.label")}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+56 9 1234 5678"
                        value={formData.phone}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, "phone")}
                        className={cn(
                          "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.phone &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        )}
                      />
                      {errors.phone && <ErrorMessage message={errors.phone} />}
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="childPhone">
                        {t("signup.child_phone.label")}
                      </Label>
                      <Input
                        id="childPhone"
                        name="childPhone"
                        type="tel"
                        placeholder="+56 9 1234 5678"
                        value={formData.childPhone}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, "childPhone")}
                        className={cn(
                          "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.childPhone &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        )}
                      />
                      {errors.childPhone && (
                        <ErrorMessage message={errors.childPhone} />
                      )}
                    </LabelInputContainer>
                  </div>
                </div>

                {/* Relationship */}
                <LabelInputContainer>
                  <Label htmlFor="relationship">
                    {t("signup.relationship.label")}
                  </Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, relationship: value }));
                      setErrors((prev) => ({ ...prev, relationship: "" }));
                    }}
                  >
                    <SelectTrigger
                      id="relationship"
                      onKeyDown={(e) => handleKeyDown(e, "relationship")}
                      className={cn(
                        "rounded-xl",
                        errors.relationship &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    >
                      <SelectValue placeholder={t("select.relationship")} />
                    </SelectTrigger>
                    <SelectContent>
                      {getRelationships(t).map((rel) => (
                        <SelectItem key={rel.value} value={rel.value}>
                          {rel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.relationship && (
                    <ErrorMessage message={errors.relationship} />
                  )}
                </LabelInputContainer>

                {/* Custom Relationship - only shown when "otro" is selected */}
                {formData.relationship === "otro" && (
                  <LabelInputContainer>
                    <Label htmlFor="customRelationship">
                      {t("signup.custom_relationship.label")}
                    </Label>
                    <Input
                      id="customRelationship"
                      name="customRelationship"
                      placeholder={t("signup.custom_relationship.placeholder")}
                      value={formData.customRelationship}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "customRelationship")}
                      className={cn(
                        "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.customRelationship &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    />
                    {errors.customRelationship && (
                      <ErrorMessage message={errors.customRelationship} />
                    )}
                  </LabelInputContainer>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {stepTitles[2]}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {stepDescriptions[2]}
                </p>
              </div>

              <div className="space-y-4">
                {/* Location Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground">
                    {t("signup.location_section.title")}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <LabelInputContainer>
                      <Label htmlFor="region">{t("signup.region.label")}</Label>
                      <Select
                        value={formData.region}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, region: value }));
                          setErrors((prev) => ({ ...prev, region: "" }));
                        }}
                      >
                        <SelectTrigger
                          id="region"
                          onKeyDown={(e) => handleKeyDown(e, "region")}
                          className={cn(
                            "rounded-xl",
                            errors.region &&
                              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                          )}
                        >
                          <SelectValue placeholder={t("select.region")} />
                        </SelectTrigger>
                        <SelectContent>
                          {getRegions(t).map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.region && (
                        <ErrorMessage message={errors.region} />
                      )}
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="comuna">{t("signup.comuna.label")}</Label>
                      <Select
                        value={formData.comuna}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, comuna: value }));
                          setErrors((prev) => ({ ...prev, comuna: "" }));
                        }}
                        disabled={!formData.region}
                      >
                        <SelectTrigger
                          id="comuna"
                          onKeyDown={(e) => handleKeyDown(e, "comuna")}
                          className={cn(
                            "rounded-xl",
                            errors.comuna &&
                              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                          )}
                        >
                          <SelectValue placeholder={t("select.comuna")} />
                        </SelectTrigger>
                        <SelectContent>
                          {comunas.map((comuna) => (
                            <SelectItem key={comuna} value={comuna}>
                              {comuna}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.comuna && (
                        <ErrorMessage message={errors.comuna} />
                      )}
                    </LabelInputContainer>
                  </div>

                  <LabelInputContainer>
                    <Label htmlFor="address">{t("signup.address.label")}</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Av. Principal 123, Comuna"
                      value={formData.address}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "address")}
                      className={cn(
                        "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.address &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    />
                    {errors.address && (
                      <ErrorMessage message={errors.address} />
                    )}
                  </LabelInputContainer>
                </div>

                {/* Institution and Grade */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground">
                    {t("signup.institution_section.title")}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <LabelInputContainer>
                      <Label htmlFor="institutionId">
                        {t("signup.institution.label")}
                      </Label>
                      <Popover
                        open={institutionPopoverOpen}
                        onOpenChange={setInstitutionPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            onKeyDown={handleInstitutionKeyDown}
                            className={cn(
                              "w-full justify-between rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                              !formData.institutionId &&
                                "text-muted-foreground",
                              errors.institutionId &&
                                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                            )}
                          >
                            {formData.institutionId
                              ? institutions.find(
                                  (institution) =>
                                    institution._id === formData.institutionId,
                                )?.name
                              : t("select.institution")}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-full min-w-(--radix-popover-trigger-width) p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput
                              placeholder="Buscar institución..."
                              className="h-9"
                            />
                            <CommandEmpty>
                              {t("signup.institutions_empty")}
                            </CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {institutions.map((institution) => (
                                <CommandItem
                                  value={institution.name}
                                  key={institution._id}
                                  onSelect={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      institutionId: institution._id,
                                    }));
                                    setErrors((prev) => ({
                                      ...prev,
                                      institutionId: "",
                                    }));
                                    setInstitutionPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      institution._id === formData.institutionId
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {institution.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {errors.institutionId && (
                        <ErrorMessage message={errors.institutionId} />
                      )}
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="childGrade">
                        {t("signup.child_grade.label")}
                      </Label>
                      <Select
                        value={formData.childGrade}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            childGrade: value,
                          }));
                          setErrors((prev) => ({ ...prev, childGrade: "" }));
                        }}
                      >
                        <SelectTrigger
                          id="childGrade"
                          onKeyDown={(e) => handleKeyDown(e, "childGrade")}
                          className={cn(
                            "rounded-xl",
                            errors.childGrade &&
                              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                          )}
                        >
                          <SelectValue placeholder={t("select.grade")} />
                        </SelectTrigger>
                        <SelectContent>
                          {getGrades(t).map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.childGrade && (
                        <ErrorMessage message={errors.childGrade} />
                      )}
                    </LabelInputContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {stepTitles[3]}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {stepDescriptions[3]}
                </p>
              </div>

              <div className="space-y-4">
                {/* Primary Emergency Contact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="emergencyContact">
                      {t("signup.emergency_contact_primary.label")}
                    </Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      placeholder="Nombre de contacto"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "emergencyContact")}
                      className={cn(
                        "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.emergencyContact &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    />
                    {errors.emergencyContact && (
                      <ErrorMessage message={errors.emergencyContact} />
                    )}
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="emergencyPhone">
                      {t("signup.emergency_phone_primary.label")}
                    </Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, "emergencyPhone")}
                      className={cn(
                        "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.emergencyPhone &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    />
                    {errors.emergencyPhone && (
                      <ErrorMessage message={errors.emergencyPhone} />
                    )}
                  </LabelInputContainer>
                </div>

                {/* Secondary Emergency Contact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="secondaryEmergencyContact">
                      {t("signup.emergency_contact_secondary.label")}
                    </Label>
                    <Input
                      id="secondaryEmergencyContact"
                      name="secondaryEmergencyContact"
                      placeholder="Nombre de contacto (opcional)"
                      value={formData.secondaryEmergencyContact}
                      onChange={handleChange}
                      onKeyDown={(e) =>
                        handleKeyDown(e, "secondaryEmergencyContact")
                      }
                      className={cn(
                        "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.secondaryEmergencyContact &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    />
                    {errors.secondaryEmergencyContact && (
                      <ErrorMessage
                        message={errors.secondaryEmergencyContact}
                      />
                    )}
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="secondaryEmergencyPhone">
                      {t("signup.emergency_phone_secondary.label")}
                    </Label>
                    <Input
                      id="secondaryEmergencyPhone"
                      name="secondaryEmergencyPhone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={formData.secondaryEmergencyPhone}
                      onChange={handleChange}
                      onKeyDown={(e) =>
                        handleKeyDown(e, "secondaryEmergencyPhone")
                      }
                      className={cn(
                        "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.secondaryEmergencyPhone &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    />
                    {errors.secondaryEmergencyPhone && (
                      <ErrorMessage message={errors.secondaryEmergencyPhone} />
                    )}
                  </LabelInputContainer>
                </div>

                {/* Tertiary Emergency Contact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="tertiaryEmergencyContact">
                      {t("signup.emergency_contact_tertiary.label")}
                    </Label>
                    <Input
                      id="tertiaryEmergencyContact"
                      name="tertiaryEmergencyContact"
                      placeholder="Nombre de contacto (opcional)"
                      value={formData.tertiaryEmergencyContact}
                      onChange={handleChange}
                      onKeyDown={(e) =>
                        handleKeyDown(e, "tertiaryEmergencyContact")
                      }
                      className={cn(
                        "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.tertiaryEmergencyContact &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    />
                    {errors.tertiaryEmergencyContact && (
                      <ErrorMessage message={errors.tertiaryEmergencyContact} />
                    )}
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="tertiaryEmergencyPhone">
                      {t("signup.emergency_phone_tertiary.label")}
                    </Label>
                    <Input
                      id="tertiaryEmergencyPhone"
                      name="tertiaryEmergencyPhone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={formData.tertiaryEmergencyPhone}
                      onChange={handleChange}
                      onKeyDown={(e) =>
                        handleKeyDown(e, "tertiaryEmergencyPhone")
                      }
                      className={cn(
                        "border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.tertiaryEmergencyPhone &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                    />
                    {errors.tertiaryEmergencyPhone && (
                      <ErrorMessage message={errors.tertiaryEmergencyPhone} />
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
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 h-full flex flex-col">
      <Card className="glass-panel mx-auto w-full max-w-2xl text-slate-900 dark:text-slate-100 grow">
        <CardHeader>
          <div className="text-center">
            <p className="text-sm font-medium text-primary">
              Paso {currentStep} de {totalSteps}: {stepTitles[currentStep - 1]}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stepDescriptions[currentStep - 1]}
            </p>
          </div>
        </CardHeader>

        <CardContent className="grow flex flex-col">
          <StepIndicator />

          <form
            onSubmit={handleSubmit}
            className="space-y-6 mt-6 grow flex flex-col"
          >
            {renderStep()}

            <div className="flex justify-between items-center pt-6 border-t border-border mt-auto">
              <Button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                variant="outline"
                className="rounded-full border-white/60 bg-white/70 px-6 text-slate-700 shadow-sm transition hover:bg-white/80 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="rounded-full bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 px-6 font-semibold shadow-lg shadow-primary/25 transition hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 px-8 py-3 font-semibold shadow-lg shadow-primary/25 transition hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? t("signup.registering")
                    : t("signup.complete_registration")}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
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
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
});

const ErrorMessage = memo(function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-medium flex items-center gap-1">
      <span className="text-red-500">⚠</span>
      {message}
    </p>
  );
});

// Display name for debugging
UnifiedSignupForm.displayName = "UnifiedSignupForm";
