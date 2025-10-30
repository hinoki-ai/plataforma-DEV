import { Metadata } from "next";
import ContactoContent from "./ContactoContent";

// Server component for metadata
export async function generateMetadata(): Promise<Metadata> {
  // Since we can't use hooks in server components, we'll use static metadata for now
  // In a real implementation, you might need to use a different approach
  return {
    title: "Contacto | Plataforma Astral",
    description:
      "Ponte en contacto con nosotros. Estamos aquí para ayudarte con tus consultas sobre educación.",
  };
}

export default function ContactoPage() {
  return <ContactoContent />;
}
