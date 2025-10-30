import { Metadata } from "next";
import { headers } from "next/headers";
import { getServerTranslation } from "@/lib/server-translations";
import ContactoContent from "./ContactoContent";

// Server component for metadata
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "es";

  // Simple language detection from Accept-Language header
  const language = acceptLanguage.startsWith("en") ? "en" : "es";

  return {
    title: getServerTranslation("page.title", "contacto", language),
    description: getServerTranslation("page.description", "contacto", language),
  };
}

export default function ContactoPage() {
  return <ContactoContent />;
}
