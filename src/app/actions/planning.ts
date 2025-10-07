"use server";

import { updatePlanningDocument } from "@/services/actions/planning";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

