import { ClerkProvider } from "@clerk/nextjs";

export const clerkConfig = {
  appearance: {
    elements: {
      formButtonPrimary:
        "bg-primary hover:bg-primary/90 text-primary-foreground",
      card: "bg-card text-card-foreground border border-border",
      headerTitle: "text-foreground",
      headerSubtitle: "text-muted-foreground",
      socialButtonsBlockButton:
        "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
      socialButtonsBlockButtonText: "text-foreground",
      formFieldInput: "bg-background border border-input text-foreground",
      formFieldLabel: "text-foreground",
      footerActionLink: "text-primary hover:text-primary/80",
    },
  },
  signInUrl: "/login",
  signUpUrl: "/registro",
  fallbackRedirectUrl: "/auth-success",
  signUpFallbackRedirectUrl: "/auth-success",
};
