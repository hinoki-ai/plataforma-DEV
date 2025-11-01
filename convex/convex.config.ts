import { defineApp } from "convex/server";

const app = defineApp();

app.setAuthConfig({
  providers: [
    {
      domain: "clerk.plataforma.aramac.dev",
      applicationID: "plataforma.aramac.dev",
    },
  ],
});

export default app;
