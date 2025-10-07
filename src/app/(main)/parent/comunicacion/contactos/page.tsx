"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { getRoleAccess } from "@/lib/role-utils";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  Phone,
  Search,
  ArrowLeft,
  MessageCircle,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  schedule?: string;
  specialties?: string[];
  isAvailable: boolean;
}

export default function ContactosPage() {
  const { data: session, status } = useSession();
  const { t } = useDivineParsing(["common", "parent"]);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock contacts data
  const contacts: Contact[] = [
    {
      id: "1",
      name: "María González",
      email: "direccion@manitospintadas.cl",
      phone: "+56 9 1234 5678",
      role: "Directora",
      department: "Dirección",
      schedule: "Lunes a Viernes: 8:00 - 17:00",
      specialties: ["Administración", "Gestión Escolar"],
      isAvailable: true,
    },
    {
      id: "2",
      name: "Carlos Rodríguez",
      email: "profesor.jefe@manitospintadas.cl",
      phone: "+56 9 2345 6789",
      role: "Profesor Jefe",
      department: "Docencia",
      schedule: "Lunes a Viernes: 8:00 - 16:00",
      specialties: ["Matemáticas", "Orientación"],
      isAvailable: true,
    },
    {
      id: "3",
      name: "Ana Silva",
      email: "pie@manitospintadas.cl",
      phone: "+56 9 3456 7890",
      role: "Coordinadora PIE",
      department: "Educación Especial",
      schedule: "Lunes a Viernes: 8:00 - 15:00",
      specialties: ["Educación Inclusiva", "Apoyo Especializado"],
      isAvailable: true,
    },
    {
      id: "4",
      name: "Dr. Patricia Morales",
      email: "psicopedagoga@manitospintadas.cl",
      phone: "+56 9 4567 8901",
      role: "Psicopedagoga",
      department: "Salud Mental",
      schedule: "Martes y Jueves: 9:00 - 14:00",
      specialties: ["Psicología Educacional", "Apoyo Emocional"],
      isAvailable: false,
    },
    {
      id: "5",
      name: "Roberto Díaz",
      email: "fonoaudiologo@manitospintadas.cl",
      phone: "+56 9 5678 9012",
      role: "Fonoaudiólogo",
      department: "Salud",
      schedule: "Lunes, Miércoles, Viernes: 9:00 - 13:00",
      specialties: ["Trastornos del Lenguaje", "Terapia del Habla"],
      isAvailable: true,
    },
    {
      id: "6",
      name: "Secretaría Administrativa",
      email: "secretaria@manitospintadas.cl",
      phone: "+56 9 8765 4321",
      role: "Administrativo",
      department: "Administración",
      schedule: "Lunes a Viernes: 8:00 - 17:00",
      specialties: ["Información General", "Trámites"],
      isAvailable: true,
    },
  ];

  // Handle loading state
  if (status === "loading") {
    return (
      <FixedBackgroundLayout backgroundImage="/images/backgrounds/communication-bg.jpg">
        <div className="flex items-center justify-center min-h-screen">
          <div>{t("parent.students.loading")}</div>
        </div>
      </FixedBackgroundLayout>
    );
  }

  // Ensure user has access to parent section
  if (!session || !session.user) {
    redirect("/login");
  }

  const roleAccess = getRoleAccess(session.user.role);
  if (!roleAccess.canAccessParent) {
    redirect("/unauthorized");
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.specialties?.some((specialty) =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const handleContactClick = (contact: Contact) => {
    // You could implement a quick message feature here
    console.log("Contact clicked:", contact);
  };

  return (
    <FixedBackgroundLayout backgroundImage="/images/backgrounds/communication-bg.jpg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/parent/comunicacion">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Directorio de Contactos
            </h1>
            <p className="text-muted-foreground">
              Encuentra y contacta al personal del establecimiento educativo
            </p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, cargo, departamento o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {contact.name}
                        </CardTitle>
                        <CardDescription>{contact.role}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={contact.isAvailable ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {contact.isAvailable ? "Disponible" : "No Disponible"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Department */}
                    {contact.department && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Departamento:</strong> {contact.department}
                      </div>
                    )}

                    {/* Schedule */}
                    {contact.schedule && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{contact.schedule}</span>
                      </div>
                    )}

                    {/* Specialties */}
                    {contact.specialties && contact.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {contact.specialties.map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Contact Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <Link
                          href={`/parent/comunicacion/nuevo?to=${encodeURIComponent(contact.email)}`}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Mensaje
                        </Link>
                      </Button>
                      {contact.phone && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`tel:${contact.phone}`}
                            aria-label={`Llamar a ${contact.name}`}
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Quick Info */}
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredContacts.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron contactos
                  </h3>
                  <p className="text-gray-500">
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contacto de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-red-700">
                  <strong>
                    Solo para emergencias durante horario escolar:
                  </strong>
                </p>
                <p className="text-red-700">
                  📞 <strong>+56 9 8765 4321</strong> - Guardia de Emergencia
                </p>
                <p className="text-sm text-red-600">
                  Este número es exclusivamente para situaciones de emergencia
                  que requieran atención inmediata.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FixedBackgroundLayout>
  );
}
