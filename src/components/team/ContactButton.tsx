"use client";

import { Button } from "@/components/ui/button";

interface ContactButtonProps {
  members: any[];
}

export function ContactButton({ members }: ContactButtonProps) {
  const handleContact = () => {
    const memberToContact = members.find((m) => {
      const specialties = m.specialties;
      if (Array.isArray(specialties)) {
        return specialties.some(
          (n: any) => typeof n === "string" && n.includes("Psicología"),
        );
      }
      return false;
    });
    if (memberToContact) {
      // Handle contact logic here
      console.log("Contacting member:", memberToContact);
    }
  };

  return (
    <Button
      variant="default"
      className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={handleContact}
    >
      Solicitar Cita
    </Button>
  );
}
