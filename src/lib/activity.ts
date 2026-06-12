import { getDb } from "@/lib/db";
import { groupActivity } from "@/lib/db/schema";
import crypto from "crypto";

type ActivityType =
  | "prediction_saved"
  | "prediction_updated"
  | "member_joined"
  | "result_loaded"
  | "prediction_deleted"
  | "scores_recalculated";

/**
 * Loggea una actividad en un grupo. Se llama desde los endpoints
 * que ejecutan acciones relevantes.
 */
export async function logActivity(params: {
  groupId: string;
  userId: string | null;
  activityType: ActivityType;
  referenceId?: string;
  message: string;
}) {
  try {
    const _db = getDb();
    await _db.insert(groupActivity).values({
      id: crypto.randomUUID(),
      groupId: params.groupId,
      userId: params.userId,
      activityType: params.activityType,
      referenceId: params.referenceId,
      message: params.message,
    });
  } catch (err) {
    // No queremos que un error de activity rompa la acción principal
    console.error("Error logging activity:", err);
  }
}
