import { deleteFile, extractPublicIdFromUrl } from "../integrations/cloudinary";

/**
 * Equivalent to Spring's DeleteFromCloudinary:
 * - byPublicId(publicId)
 * - byUrl(url) -> extracts publicId -> delete
 */

export async function deleteFromCloudinaryByPublicId(
    publicId: string
): Promise<Record<string, unknown>> {
    return deleteFile(publicId, true);
}

export async function deleteFromCloudinaryByUrl(
    url?: string | null
): Promise<Record<string, unknown> | null> {
    const pid = extractPublicIdFromUrl(url);
    if (!pid || !pid.trim()) return null;
    return deleteFile(pid, true);
}