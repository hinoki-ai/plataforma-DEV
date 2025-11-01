"use server";

import {
  createPlanningDocument,
  updatePlanningDocument,
} from "@/services/actions/planning";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPlanningDocumentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const subject = formData.get("subject") as string;
  const grade = formData.get("grade") as string;
  const attachments = formData.get("attachments");

  const result = await createPlanningDocument({
    title,
    content,
    subject,
    grade,
    authorId: session.user.id,
    attachments: attachments ? JSON.parse(attachments as string) : undefined,
  });

  if (result.success) {
    revalidatePath("/profesor/planificaciones");
    redirect("/profesor/planificaciones");
  } else {
    throw new Error(result.error || "No se pudo crear el documento");
  }
}

export async function updatePlanningDocumentAction(
  id: string,
  formData: FormData,
) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const subject = formData.get("subject") as string;
  const grade = formData.get("grade") as string;
  const attachments = formData.get("attachments");

  const result = await updatePlanningDocument(id, {
    title,
    content,
    subject,
    grade,
    attachments: attachments ? JSON.parse(attachments as string) : undefined,
  });

  if (result.success) {
    revalidatePath(`/profesor/planificaciones/${id}`);
    redirect(`/profesor/planificaciones/${id}`);
  } else {
    throw new Error(result.error || "Failed to update planning document");
  }
}
