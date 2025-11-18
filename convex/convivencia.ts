/**
 * Convivencia Escolar Management
 * Chilean Educational System - Protocolos de Convivencia Escolar
 * Handles normas, disciplina cases, medidas, reconocimientos, and actas
 */

import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { tenantMutation, tenantQuery } from "./tenancy";

type AnyCtx = QueryCtx | MutationCtx;

// ==================== QUERIES - NORMAS ====================

export const getNormas = tenantQuery({
  args: {
    category: v.optional(
      v.union(
        v.literal("VALORES"),
        v.literal("DISCIPLINA"),
        v.literal("APRENDIZAJE"),
        v.literal("RESPONSABILIDAD"),
        v.literal("TECNOLOGIA"),
        v.literal("PARTICIPACION"),
        v.literal("OTRO"),
      ),
    ),
    status: v.optional(
      v.union(v.literal("ACTIVE"), v.literal("INACTIVE"), v.literal("REVIEW")),
    ),
  },
  handler: async (ctx, { category, status }, tenancy) => {
    let normas = await ctx.db
      .query("convivenciaNormas")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    if (category) {
      normas = normas.filter((n: any) => n.category === category);
    }

    if (status) {
      normas = normas.filter((n: any) => n.status === status);
    }

    return normas.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

export const getNormaById = tenantQuery({
  args: {
    normaId: v.id("convivenciaNormas"),
  },
  handler: async (ctx, { normaId }, tenancy) => {
    const norma = await ctx.db.get(normaId);
    if (!norma || norma.institutionId !== tenancy.institution._id) {
      return null;
    }
    return norma;
  },
});

// ==================== MUTATIONS - NORMAS ====================

export const createNorma = tenantMutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("VALORES"),
      v.literal("DISCIPLINA"),
      v.literal("APRENDIZAJE"),
      v.literal("RESPONSABILIDAD"),
      v.literal("TECNOLOGIA"),
      v.literal("PARTICIPACION"),
      v.literal("OTRO"),
    ),
    status: v.optional(
      v.union(v.literal("ACTIVE"), v.literal("INACTIVE"), v.literal("REVIEW")),
    ),
    examples: v.optional(v.array(v.string())),
    importance: v.optional(
      v.union(v.literal("HIGH"), v.literal("MEDIUM"), v.literal("LOW")),
    ),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    const normaId = await ctx.db.insert("convivenciaNormas", {
      institutionId: tenancy.institution._id,
      title: args.title,
      description: args.description,
      category: args.category,
      status: args.status || "ACTIVE",
      examples: args.examples,
      importance: args.importance || "MEDIUM",
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });
    return normaId;
  },
});

export const updateNorma = tenantMutation({
  args: {
    normaId: v.id("convivenciaNormas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("VALORES"),
        v.literal("DISCIPLINA"),
        v.literal("APRENDIZAJE"),
        v.literal("RESPONSABILIDAD"),
        v.literal("TECNOLOGIA"),
        v.literal("PARTICIPACION"),
        v.literal("OTRO"),
      ),
    ),
    status: v.optional(
      v.union(v.literal("ACTIVE"), v.literal("INACTIVE"), v.literal("REVIEW")),
    ),
    examples: v.optional(v.array(v.string())),
    importance: v.optional(
      v.union(v.literal("HIGH"), v.literal("MEDIUM"), v.literal("LOW")),
    ),
  },
  handler: async (ctx, args, tenancy) => {
    const norma = await ctx.db.get(args.normaId);
    if (!norma || norma.institutionId !== tenancy.institution._id) {
      throw new Error("Norma not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.status !== undefined) updates.status = args.status;
    if (args.examples !== undefined) updates.examples = args.examples;
    if (args.importance !== undefined) updates.importance = args.importance;

    await ctx.db.patch(args.normaId, updates);
    return args.normaId;
  },
});

export const deleteNorma = tenantMutation({
  args: {
    normaId: v.id("convivenciaNormas"),
  },
  handler: async (ctx, { normaId }, tenancy) => {
    const norma = await ctx.db.get(normaId);
    if (!norma || norma.institutionId !== tenancy.institution._id) {
      throw new Error("Norma not found");
    }
    await ctx.db.delete(normaId);
    return normaId;
  },
});

// ==================== QUERIES - DISCIPLINA ====================

export const getDisciplinaCases = tenantQuery({
  args: {
    studentId: v.optional(v.id("students")),
    courseId: v.optional(v.id("courses")),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("IN_PROGRESS"),
        v.literal("RESOLVED"),
        v.literal("CLOSED"),
      ),
    ),
    severity: v.optional(
      v.union(v.literal("LEVE"), v.literal("GRAVE"), v.literal("GRAVISIMA")),
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args, tenancy) => {
    let cases = await ctx.db
      .query("convivenciaDisciplina")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    if (args.studentId) {
      cases = cases.filter((c: any) => c.studentId === args.studentId);
    }

    if (args.courseId) {
      cases = cases.filter((c: any) => c.courseId === args.courseId);
    }

    if (args.status) {
      cases = cases.filter((c: any) => c.status === args.status);
    }

    if (args.severity) {
      cases = cases.filter((c: any) => c.severity === args.severity);
    }

    if (args.startDate) {
      cases = cases.filter((c: any) => c.date >= args.startDate!);
    }

    if (args.endDate) {
      cases = cases.filter((c: any) => c.date <= args.endDate!);
    }

    return cases.sort((a: any, b: any) => b.date - a.date);
  },
});

export const getDisciplinaCaseById = tenantQuery({
  args: {
    caseId: v.id("convivenciaDisciplina"),
  },
  handler: async (ctx, { caseId }, tenancy) => {
    const caso = await ctx.db.get(caseId);
    if (!caso || caso.institutionId !== tenancy.institution._id) {
      return null;
    }
    return caso;
  },
});

// ==================== MUTATIONS - DISCIPLINA ====================

export const createDisciplinaCase = tenantMutation({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
    normaId: v.optional(v.id("convivenciaNormas")),
    date: v.number(),
    description: v.string(),
    severity: v.union(v.literal("LEVE"), v.literal("GRAVE"), v.literal("GRAVISIMA")),
    medidaId: v.optional(v.id("convivenciaMedidas")),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("IN_PROGRESS"),
        v.literal("RESOLVED"),
        v.literal("CLOSED"),
      ),
    ),
    actionTaken: v.optional(v.string()),
    notes: v.optional(v.string()),
    reportedBy: v.id("users"),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    const caseId = await ctx.db.insert("convivenciaDisciplina", {
      institutionId: tenancy.institution._id,
      studentId: args.studentId,
      courseId: args.courseId,
      normaId: args.normaId,
      date: args.date,
      description: args.description,
      severity: args.severity,
      medidaId: args.medidaId,
      status: args.status || "PENDING",
      actionTaken: args.actionTaken,
      notes: args.notes,
      reportedBy: args.reportedBy,
      assignedTo: args.assignedTo,
      createdAt: now,
      updatedAt: now,
    });
    return caseId;
  },
});

export const updateDisciplinaCase = tenantMutation({
  args: {
    caseId: v.id("convivenciaDisciplina"),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("IN_PROGRESS"),
        v.literal("RESOLVED"),
        v.literal("CLOSED"),
      ),
    ),
    medidaId: v.optional(v.id("convivenciaMedidas")),
    actionTaken: v.optional(v.string()),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args, tenancy) => {
    const caso = await ctx.db.get(args.caseId);
    if (!caso || caso.institutionId !== tenancy.institution._id) {
      throw new Error("Case not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.status !== undefined) updates.status = args.status;
    if (args.medidaId !== undefined) updates.medidaId = args.medidaId;
    if (args.actionTaken !== undefined) updates.actionTaken = args.actionTaken;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.assignedTo !== undefined) updates.assignedTo = args.assignedTo;

    await ctx.db.patch(args.caseId, updates);
    return args.caseId;
  },
});

// ==================== QUERIES - MEDIDAS ====================

export const getMedidas = tenantQuery({
  args: {
    category: v.optional(
      v.union(
        v.literal("PREVENTIVA"),
        v.literal("FORMATIVA"),
        v.literal("CORRECTIVA"),
        v.literal("SANCIONADORA"),
        v.literal("APOYO"),
        v.literal("OTRA"),
      ),
    ),
    applicableTo: v.optional(
      v.union(
        v.literal("LEVE"),
        v.literal("GRAVE"),
        v.literal("GRAVISIMA"),
        v.literal("ALL"),
      ),
    ),
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"))),
  },
  handler: async (ctx, args, tenancy) => {
    let medidas = await ctx.db
      .query("convivenciaMedidas")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    if (args.category) {
      medidas = medidas.filter((m: Doc<"convivenciaMedidas">) => m.category === args.category);
    }

    if (args.applicableTo) {
      medidas = medidas.filter(
        (m: Doc<"convivenciaMedidas">) => m.applicableTo === args.applicableTo || m.applicableTo === "ALL",
      );
    }

    if (args.status) {
      medidas = medidas.filter((m: Doc<"convivenciaMedidas">) => m.status === args.status);
    }

    return medidas.sort((a: Doc<"convivenciaMedidas">, b: Doc<"convivenciaMedidas">) => b.createdAt - a.createdAt);
  },
});

export const getMedidaById = tenantQuery({
  args: {
    medidaId: v.id("convivenciaMedidas"),
  },
  handler: async (ctx, { medidaId }, tenancy) => {
    const medida = await ctx.db.get(medidaId);
    if (!medida || medida.institutionId !== tenancy.institution._id) {
      return null;
    }
    return medida;
  },
});

// ==================== MUTATIONS - MEDIDAS ====================

export const createMedida = tenantMutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("PREVENTIVA"),
      v.literal("FORMATIVA"),
      v.literal("CORRECTIVA"),
      v.literal("SANCIONADORA"),
      v.literal("APOYO"),
      v.literal("OTRA"),
    ),
    applicableTo: v.union(
      v.literal("LEVE"),
      v.literal("GRAVE"),
      v.literal("GRAVISIMA"),
      v.literal("ALL"),
    ),
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"))),
    criteria: v.optional(v.string()),
    duration: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    const medidaId = await ctx.db.insert("convivenciaMedidas", {
      institutionId: tenancy.institution._id,
      title: args.title,
      description: args.description,
      category: args.category,
      applicableTo: args.applicableTo,
      status: args.status || "ACTIVE",
      criteria: args.criteria,
      duration: args.duration,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });
    return medidaId;
  },
});

export const updateMedida = tenantMutation({
  args: {
    medidaId: v.id("convivenciaMedidas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("PREVENTIVA"),
        v.literal("FORMATIVA"),
        v.literal("CORRECTIVA"),
        v.literal("SANCIONADORA"),
        v.literal("APOYO"),
        v.literal("OTRA"),
      ),
    ),
    applicableTo: v.optional(
      v.union(
        v.literal("LEVE"),
        v.literal("GRAVE"),
        v.literal("GRAVISIMA"),
        v.literal("ALL"),
      ),
    ),
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"))),
    criteria: v.optional(v.string()),
    duration: v.optional(v.string()),
  },
  handler: async (ctx, args, tenancy) => {
    const medida = await ctx.db.get(args.medidaId);
    if (!medida || medida.institutionId !== tenancy.institution._id) {
      throw new Error("Medida not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.applicableTo !== undefined) updates.applicableTo = args.applicableTo;
    if (args.status !== undefined) updates.status = args.status;
    if (args.criteria !== undefined) updates.criteria = args.criteria;
    if (args.duration !== undefined) updates.duration = args.duration;

    await ctx.db.patch(args.medidaId, updates);
    return args.medidaId;
  },
});

// ==================== QUERIES - RECONOCIMIENTOS ====================

export const getReconocimientos = tenantQuery({
  args: {
    studentId: v.optional(v.id("students")),
    courseId: v.optional(v.id("courses")),
    category: v.optional(
      v.union(
        v.literal("ACADEMICO"),
        v.literal("COMPORTAMIENTO"),
        v.literal("PARTICIPACION"),
        v.literal("SOLIDARIDAD"),
        v.literal("SUPERACION"),
        v.literal("OTRO"),
      ),
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args, tenancy) => {
    let reconocimientos = await ctx.db
      .query("convivenciaReconocimientos")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    if (args.studentId) {
      reconocimientos = reconocimientos.filter(
        (r: Doc<"convivenciaReconocimientos">) => r.studentId === args.studentId,
      );
    }

    if (args.courseId) {
      reconocimientos = reconocimientos.filter(
        (r: Doc<"convivenciaReconocimientos">) => r.courseId === args.courseId,
      );
    }

    if (args.category) {
      reconocimientos = reconocimientos.filter((r: Doc<"convivenciaReconocimientos">) => r.category === args.category);
    }

    if (args.startDate) {
      reconocimientos = reconocimientos.filter(
        (r: Doc<"convivenciaReconocimientos">) => r.date >= args.startDate!,
      );
    }

    if (args.endDate) {
      reconocimientos = reconocimientos.filter((r: Doc<"convivenciaReconocimientos">) => r.date <= args.endDate!);
    }

    return reconocimientos.sort((a: Doc<"convivenciaReconocimientos">, b: Doc<"convivenciaReconocimientos">) => b.date - a.date);
  },
});

// ==================== MUTATIONS - RECONOCIMIENTOS ====================

export const createReconocimiento = tenantMutation({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("ACADEMICO"),
      v.literal("COMPORTAMIENTO"),
      v.literal("PARTICIPACION"),
      v.literal("SOLIDARIDAD"),
      v.literal("SUPERACION"),
      v.literal("OTRO"),
    ),
    date: v.number(),
    awardedBy: v.id("users"),
    notes: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    const reconocimientoId = await ctx.db.insert("convivenciaReconocimientos", {
      institutionId: tenancy.institution._id,
      studentId: args.studentId,
      courseId: args.courseId,
      type: args.type,
      title: args.title,
      description: args.description,
      category: args.category,
      date: args.date,
      awardedBy: args.awardedBy,
      notes: args.notes,
      isPublic: args.isPublic ?? true,
      createdAt: now,
      updatedAt: now,
    });
    return reconocimientoId;
  },
});

// ==================== QUERIES - ACTAS ====================

export const getActasApoderados = tenantQuery({
  args: {
    courseId: v.optional(v.id("courses")),
    relatedTo: v.optional(
      v.union(
        v.literal("NORMAS"),
        v.literal("DISCIPLINA"),
        v.literal("MEDIDAS"),
        v.literal("RECONOCIMIENTOS"),
        v.literal("GENERAL"),
      ),
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args, tenancy) => {
    let actas = await ctx.db
      .query("convivenciaActasApoderados")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    if (args.courseId) {
      actas = actas.filter((a: Doc<"convivenciaActasApoderados">) => a.courseId === args.courseId);
    }

    if (args.relatedTo) {
      actas = actas.filter((a: Doc<"convivenciaActasApoderados">) => a.relatedTo === args.relatedTo);
    }

    if (args.startDate) {
      actas = actas.filter((a: Doc<"convivenciaActasApoderados">) => a.meetingDate >= args.startDate!);
    }

    if (args.endDate) {
      actas = actas.filter((a: Doc<"convivenciaActasApoderados">) => a.meetingDate <= args.endDate!);
    }

    return actas.sort((a: Doc<"convivenciaActasApoderados">, b: Doc<"convivenciaActasApoderados">) => b.meetingDate - a.meetingDate);
  },
});

export const getActasAlumnos = tenantQuery({
  args: {
    courseId: v.optional(v.id("courses")),
    relatedTo: v.optional(
      v.union(
        v.literal("NORMAS"),
        v.literal("DISCIPLINA"),
        v.literal("MEDIDAS"),
        v.literal("RECONOCIMIENTOS"),
        v.literal("GENERAL"),
      ),
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args, tenancy) => {
    let actas = await ctx.db
      .query("convivenciaActasAlumnos")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    if (args.courseId) {
      actas = actas.filter((a: Doc<"convivenciaActasAlumnos">) => a.courseId === args.courseId);
    }

    if (args.relatedTo) {
      actas = actas.filter((a: Doc<"convivenciaActasAlumnos">) => a.relatedTo === args.relatedTo);
    }

    if (args.startDate) {
      actas = actas.filter((a: Doc<"convivenciaActasAlumnos">) => a.meetingDate >= args.startDate!);
    }

    if (args.endDate) {
      actas = actas.filter((a: Doc<"convivenciaActasAlumnos">) => a.meetingDate <= args.endDate!);
    }

    return actas.sort((a: Doc<"convivenciaActasAlumnos">, b: Doc<"convivenciaActasAlumnos">) => b.meetingDate - a.meetingDate);
  },
});

// ==================== MUTATIONS - ACTAS ====================

export const createActaApoderados = tenantMutation({
  args: {
    courseId: v.optional(v.id("courses")),
    meetingDate: v.number(),
    meetingNumber: v.number(),
    title: v.string(),
    content: v.string(),
    attendees: v.array(v.string()),
    topics: v.array(v.string()),
    agreements: v.optional(v.array(v.string())),
    relatedTo: v.optional(
      v.union(
        v.literal("NORMAS"),
        v.literal("DISCIPLINA"),
        v.literal("MEDIDAS"),
        v.literal("RECONOCIMIENTOS"),
        v.literal("GENERAL"),
      ),
    ),
    createdBy: v.id("users"),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    const actaId = await ctx.db.insert("convivenciaActasApoderados", {
      institutionId: tenancy.institution._id,
      courseId: args.courseId,
      meetingDate: args.meetingDate,
      meetingNumber: args.meetingNumber,
      title: args.title,
      content: args.content,
      attendees: args.attendees,
      topics: args.topics,
      agreements: args.agreements,
      relatedTo: args.relatedTo || "GENERAL",
      createdBy: args.createdBy,
      isPublic: args.isPublic ?? true,
      createdAt: now,
      updatedAt: now,
    });
    return actaId;
  },
});

export const createActaAlumnos = tenantMutation({
  args: {
    courseId: v.optional(v.id("courses")),
    meetingDate: v.number(),
    meetingNumber: v.number(),
    title: v.string(),
    content: v.string(),
    attendees: v.array(v.string()),
    topics: v.array(v.string()),
    agreements: v.optional(v.array(v.string())),
    relatedTo: v.optional(
      v.union(
        v.literal("NORMAS"),
        v.literal("DISCIPLINA"),
        v.literal("MEDIDAS"),
        v.literal("RECONOCIMIENTOS"),
        v.literal("GENERAL"),
      ),
    ),
    createdBy: v.id("users"),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    const actaId = await ctx.db.insert("convivenciaActasAlumnos", {
      institutionId: tenancy.institution._id,
      courseId: args.courseId,
      meetingDate: args.meetingDate,
      meetingNumber: args.meetingNumber,
      title: args.title,
      content: args.content,
      attendees: args.attendees,
      topics: args.topics,
      agreements: args.agreements,
      relatedTo: args.relatedTo || "GENERAL",
      createdBy: args.createdBy,
      isPublic: args.isPublic ?? true,
      createdAt: now,
      updatedAt: now,
    });
    return actaId;
  },
});

