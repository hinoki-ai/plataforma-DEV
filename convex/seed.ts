/**
 * Convex Seed Script
 * Creates initial test users and data for development
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  args: {
    skipIfUsersExist: v.optional(v.boolean()),
  },
  handler: async (ctx, { skipIfUsersExist = true }) => {
    // PRODUCTION SAFETY: Check if users already exist
    if (skipIfUsersExist) {
      const existingUsers = await ctx.db.query("users").first();
      if (existingUsers) {
        throw new Error(
          "⚠️ PRODUCTION SAFETY: Users already exist in database. " +
            "This seed script is for NEW databases only. " +
            "To force seed (will create duplicate users), pass skipIfUsersExist: false",
        );
      }
    }

    const now = Date.now();

    // Create primary institution record first
    const institutionId = await ctx.db.insert("institutionInfo", {
      name: "Escuela Especial de Lenguaje Plataforma Astral",
      mission:
        "Queremos que cada niño y niña crezca feliz, aprenda y se desarrolle en un ambiente de respeto y cariño. Buscamos que todos puedan aprender, convivir y prepararse para la vida, valorando siempre la alegría y la sencillez.",
      vision:
        "Soñamos con ser una escuelita reconocida por su trabajo en equipo, donde cada estudiante es valorado y apoyado. Queremos que nuestros estudiantes sean personas responsables, creativas y alegres, preparadas para aportar a su comunidad y al mundo.",
      address: "Anibal Pinto Nº 160, Los Sauces, Chile",
      phone: "+56 45 278 3486",
      email: "contacto@plataformaastral.cl",
      website: "https://plataforma-astral.vercel.app",
      institutionType: "PRESCHOOL",
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    // Password: 59163476a, admin123, profesor123, parent123
    // Pre-hashed with bcrypt (10 rounds) - UPDATED HASHES
    const hashedMasterPassword =
      "$2b$10$DIdRzGR5r9lckpG7X5jr9OIQHiFMYGXLcGnVyBDnRwAu.pnAwZMg6";
    const hashedAdminPassword =
      "$2b$10$rcuVz6SAAsmXGpqtEfyMAu4qp9qh9O/7rgF/j8E8PBZIBA6lA2yse";
    const hashedProfesorPassword =
      "$2b$10$5HeL15fadPfphQwoFo5v3uL2D.KvFhDIC84G9FZEHYa9IV7zVnllW";
    const hashedParentPassword =
      "$2b$10$PztmJfNsa4ziz3T7AkfK8egkjSsM9A0qmH16EKGbriaImmqz7N1za";

    // Create Master User (Supreme Access)
    const masterId = await ctx.db.insert("users", {
      name: "Agustin",
      email: "agustin@astral.cl",
      password: hashedMasterPassword,
      role: "MASTER",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      phone: "+56900000000",
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
      currentInstitutionId: institutionId,
    });

    // Create Admin User
    const adminId = await ctx.db.insert("users", {
      name: "Administrador Principal",
      email: "admin@plataforma-astral.com",
      password: hashedAdminPassword,
      role: "ADMIN",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      phone: "+56912345678",
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
      currentInstitutionId: institutionId,
    });

    // Create Profesor User
    const profesorId = await ctx.db.insert("users", {
      name: "Profesor de Prueba",
      email: "profesor@plataforma-astral.com",
      password: hashedProfesorPassword,
      role: "PROFESOR",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      phone: "+56987654321",
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
      currentInstitutionId: institutionId,
    });

    // Create Parent User
    const parentId = await ctx.db.insert("users", {
      name: "Padre/Madre de Prueba",
      email: "parent@plataforma-astral.com",
      password: hashedParentPassword,
      role: "PARENT",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      phone: "+56911223344",
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
      currentInstitutionId: institutionId,
    });

    // Create institution memberships
    await ctx.db.insert("institutionMemberships", {
      institutionId,
      userId: adminId,
      role: "ADMIN",
      status: "ACTIVE",
      invitedBy: masterId,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("institutionMemberships", {
      institutionId,
      userId: profesorId,
      role: "PROFESOR",
      status: "ACTIVE",
      invitedBy: adminId,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("institutionMemberships", {
      institutionId,
      userId: parentId,
      role: "PARENT",
      status: "ACTIVE",
      invitedBy: adminId,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create a sample student
    const studentId = await ctx.db.insert("students", {
      firstName: "Juan",
      lastName: "Pérez",
      birthDate: new Date("2018-01-15").getTime(),
      grade: "Pre-Kinder",
      enrollmentDate: now,
      teacherId: profesorId,
      parentId: parentId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      institutionId,
    });

    // Create a sample meeting
    const tomorrow = now + 24 * 60 * 60 * 1000;
    await ctx.db.insert("meetings", {
      title: "Reunión de Apoderados",
      description: "Reunión mensual para discutir progreso",
      studentName: "Juan Pérez",
      studentGrade: "Pre-Kinder",
      guardianName: "Padre/Madre de Prueba",
      guardianEmail: "parent@plataforma-astral.com",
      guardianPhone: "+56911223344",
      scheduledDate: tomorrow,
      scheduledTime: "15:00",
      duration: 30,
      location: "Sala 1",
      status: "SCHEDULED",
      type: "PARENT_TEACHER",
      assignedTo: profesorId,
      followUpRequired: false,
      source: "STAFF_CREATED",
      parentRequested: false,
      studentId,
      createdAt: now,
      updatedAt: now,
      institutionId,
    });

    // Create sample calendar event
    await ctx.db.insert("calendarEvents", {
      title: "Inicio del Año Escolar",
      description: "Primer día de clases",
      startDate: now,
      endDate: now + 8 * 60 * 60 * 1000, // 8 hours later
      category: "ACADEMIC",
      priority: "HIGH",
      level: "Pre-Kinder",
      isRecurring: false,
      isAllDay: false,
      isActive: true,
      createdBy: adminId,
      updatedBy: adminId,
      version: 1,
      createdAt: now,
      updatedAt: now,
      institutionId,
    });

    return {
      success: true,
      message: "Database seeded successfully!",
      users: {
        master: masterId,
        admin: adminId,
        profesor: profesorId,
        parent: parentId,
      },
      student: studentId,
      institution: institutionId,
    };
  },
});

export const seedInstitutions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const institutions = [
      {
        name: "Jardín Infantil Los Pequeños Soñadores",
        mission:
          "Brindar educación preescolar de calidad que fomente el desarrollo integral de los niños en un ambiente seguro y amoroso.",
        vision:
          "Ser un referente en educación inicial que prepare a los niños para una transición exitosa hacia la educación básica.",
        address: "Av. Providencia 1234, Santiago, Región Metropolitana",
        phone: "+56 2 2345 6789",
        email: "contacto@pequenosssoadores.cl",
        website: "https://www.pequenosssoadores.cl",
        institutionType: "PRESCHOOL" as const,
      },
      {
        name: "Colegio San Francisco de Asís",
        mission:
          "Formar integralmente a los estudiantes desde la educación básica, promoviendo valores cristianos y excelencia académica.",
        vision:
          "Ser una institución educativa líder que forme ciudadanos comprometidos con su comunidad y el desarrollo del país.",
        address: "Calle San Francisco 567, Viña del Mar, Región de Valparaíso",
        phone: "+56 32 2345 6789",
        email: "info@sanfrancisco.cl",
        website: "https://www.sanfrancisco.cl",
        institutionType: "BASIC_SCHOOL" as const,
      },
      {
        name: "Liceo Nacional José Manuel Balmaceda",
        mission:
          "Proporcionar educación secundaria de calidad que prepare a los jóvenes para la educación superior y el mundo laboral.",
        vision:
          "Formar líderes éticos y competentes que contribuyan al progreso de Chile.",
        address: "Av. Balmaceda 890, Concepción, Región del Biobío",
        phone: "+56 41 2345 6789",
        email: "liceobalmaceda@liceos.cl",
        website: "https://www.liceobalmaceda.cl",
        institutionType: "HIGH_SCHOOL" as const,
      },
      {
        name: "Escuela Básica República de Chile",
        mission:
          "Ofrecer educación básica inclusiva que promueva el aprendizaje significativo y el desarrollo de habilidades para la vida.",
        vision:
          "Ser una escuela modelo que garantice educación de calidad para todos los niños de la comunidad.",
        address: "Calle República 1122, La Serena, Región de Coquimbo",
        phone: "+56 51 2345 6789",
        email: "contacto@escuelarepublica.cl",
        website: "https://www.escuelarepublica.cl",
        institutionType: "BASIC_SCHOOL" as const,
      },
      {
        name: "Centro de Formación Técnica INACAP Santiago",
        mission:
          "Entregar formación técnica de excelencia que responda a las necesidades del mercado laboral nacional e internacional.",
        vision:
          "Ser el referente en formación técnica profesional que impulse el desarrollo económico y social de Chile.",
        address: "Av. Vitacura 12901, Santiago, Región Metropolitana",
        phone: "+56 2 3456 7890",
        email: "admisión@inacap.cl",
        website: "https://www.inacap.cl",
        institutionType: "UNIVERSITY" as const,
      },
      {
        name: "Jardín Infantil Mi Primer Paso",
        mission:
          "Acompañar el desarrollo temprano de los niños a través de experiencias educativas lúdicas y significativas.",
        vision:
          "Crear las bases sólidas para que cada niño alcance su máximo potencial desde sus primeros años.",
        address: "Calle Los Aromos 456, Temuco, Región de La Araucanía",
        phone: "+56 45 2345 6789",
        email: "info@primerpaso.cl",
        website: "https://www.primerpaso.cl",
        institutionType: "PRESCHOOL" as const,
      },
      {
        name: "Colegio Santa María de Los Ángeles",
        mission:
          "Educar con valores cristianos, promoviendo el desarrollo académico, espiritual y social de nuestros estudiantes.",
        vision:
          "Formar personas íntegras que sean luz en la sociedad y contribuyan al bien común.",
        address: "Av. Los Ángeles 789, Los Ángeles, Región del Biobío",
        phone: "+56 43 2345 6789",
        email: "colegio@santamaria.cl",
        website: "https://www.santamaria.cl",
        institutionType: "BASIC_SCHOOL" as const,
      },
      {
        name: "Liceo Politécnico Arturo Prat",
        mission:
          "Proporcionar educación técnico-profesional que combine formación académica con preparación laboral especializada.",
        vision:
          "Ser un liceo técnico líder que forme profesionales competentes y emprendedores.",
        address: "Calle Prat 1011, Iquique, Región de Tarapacá",
        phone: "+56 57 2345 6789",
        email: "liceoprat@liceos.cl",
        website: "https://www.liceoprat.cl",
        institutionType: "HIGH_SCHOOL" as const,
      },
      {
        name: "Escuela Básica Gabriela Mistral",
        mission:
          "Fomentar el aprendizaje significativo y el desarrollo de competencias que permitan a los estudiantes enfrentar los desafíos del siglo XXI.",
        vision:
          "Ser una institución educativa innovadora que inspire y motive a sus estudiantes a ser ciudadanos activos y responsables.",
        address:
          "Av. Mistral 1213, Rancagua, Región del Libertador Bernardo O'Higgins",
        phone: "+56 72 2345 6789",
        email: "escuela@gabrielamistral.cl",
        website: "https://www.gabrielamistral.cl",
        institutionType: "BASIC_SCHOOL" as const,
      },
      {
        name: "Centro de Formación Técnica DUOC UC",
        mission:
          "Ofrecer formación técnica superior de calidad que integre teoría y práctica para formar profesionales competentes.",
        vision:
          "Ser el centro de formación técnica más innovador y conectado con el mundo laboral chileno.",
        address: "Av. Plaza 680, Santiago, Región Metropolitana",
        phone: "+56 2 4567 8901",
        email: "admision@duoc.cl",
        website: "https://www.duoc.cl",
        institutionType: "UNIVERSITY" as const,
      },
    ];

    // Check existing institutions to avoid duplicates
    const existingInstitutions = await ctx.db
      .query("institutionInfo")
      .collect();
    const existingNames = new Set(
      existingInstitutions.map((inst) => inst.name),
    );

    let createdCount = 0;
    const results = [];

    for (const institution of institutions) {
      if (existingNames.has(institution.name)) {
        results.push(`Skipped: ${institution.name} (already exists)`);
        continue;
      }

      try {
        const institutionId = await ctx.db.insert("institutionInfo", {
          ...institution,
          createdAt: now,
          updatedAt: now,
          isActive: true,
        });
        results.push(
          `Created: ${institution.name} (${institution.institutionType})`,
        );
        createdCount++;
      } catch (error) {
        results.push(`Failed: ${institution.name} - ${error}`);
      }
    }

    return {
      success: true,
      message: `Seeded ${createdCount} institutions successfully!`,
      results,
      totalCreated: createdCount,
    };
  },
});

export const clearDatabase = mutation({
  args: { confirm: v.boolean(), safetyCode: v.optional(v.string()) },
  handler: async (ctx, { confirm, safetyCode }) => {
    if (!confirm) {
      throw new Error("Must confirm to clear database");
    }

    // PRODUCTION SAFETY: Require special code to clear database
    const SAFETY_CODE = "DELETE_ALL_DATA_PERMANENTLY_2024";
    if (safetyCode !== SAFETY_CODE) {
      throw new Error(
        "⚠️ PRODUCTION SAFETY: This will delete ALL data including real users. " +
          "To proceed, you must provide the correct safetyCode parameter. " +
          "DO NOT run this in production unless you're absolutely sure!",
      );
    }

    // Clear all tables (in reverse order of dependencies)
    const tables = [
      "voteResponses",
      "voteOptions",
      "votes",
      "videoCapsules",
      "videos",
      "photos",
      "notifications",
      "activities",
      "studentProgressReports",
      "recurrenceRules",
      "calendarEventTemplates",
      "calendarEvents",
      "meetingTemplates",
      "meetings",
      "students",
      "teamMembers",
      "institutionInfo",
      "planningDocuments",
      "users",
    ] as const;

    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    return {
      success: true,
      message: "Database cleared successfully!",
    };
  },
});
