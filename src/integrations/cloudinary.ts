import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { env } from "../config/env";

/**
 * Cloudinary integration (Spring parity):
 * - deleteFile(publicId, invalidate=true)
 * - extractPublicIdFromUrl(url)
 * - buildPublicId(prefixSlug) = slug + timestamp + shortUuid
 * - rename(from, to, overwrite)
 */

const isCloudinaryConfigured =
    !!env.CLOUDINARY_CLOUD_NAME &&
    !!env.CLOUDINARY_API_KEY &&
    !!env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME!,
        api_key: env.CLOUDINARY_API_KEY!,
        api_secret: env.CLOUDINARY_API_SECRET!,
    });
}

export function assertCloudinaryConfigured(): void {
    if (!isCloudinaryConfigured) {
        throw new Error(
            "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
        );
    }
}

export function safeSlug(input?: string | null): string {
    if (!input) return "asset";
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function shortUuid(): string {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const crypto = require("crypto") as typeof import("crypto");
        return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    } catch {
        return Math.random().toString(16).slice(2, 10);
    }
}

/** Spring parity: slug + timestamp + short-uuid */
export function buildPublicId(prefixSlug?: string | null): string {
    const slug = safeSlug(prefixSlug);
    const ts = globalThis.Date.now();
    return `${slug}_${ts}_${shortUuid()}`;
}

/**
 * Spring parity: extract publicId from standard Cloudinary URL:
 * https://res.cloudinary.com/<cloud>/image/upload/v123/<folder>/name.ext
 */
export function extractPublicIdFromUrl(url?: string | null): string | null {
    if (!url || !url.trim()) return null;

    const clean = url.split("?")[0];

    const uploadIdx = clean.indexOf("/upload/");
    if (uploadIdx < 0) return null;

    // ✅ FIX: length is a property, not a function
    let tail = clean.substring(uploadIdx + "/upload/".length);

    // Remove version segment v123456/ if present
    tail = tail.replace(/^v\d+\//, "");

    // Remove extension
    const dot = tail.lastIndexOf(".");
    const noExt = dot > 0 ? tail.substring(0, dot) : tail;

    return noExt || null;
}

/** Delete by publicId (invalidate CDN by default) — Spring parity */
export async function deleteFile(
    publicId: string,
    invalidate = true
): Promise<Record<string, unknown>> {
    assertCloudinaryConfigured();

    if (!publicId || !publicId.trim()) {
        throw new Error("publicId is required to delete a Cloudinary asset.");
    }

    const res = await cloudinary.uploader.destroy(publicId, { invalidate });
    return res as unknown as Record<string, unknown>;
}

export async function deleteFiles(
    publicIds: Array<string | null | undefined>,
    invalidate = true
): Promise<Array<Record<string, unknown>>> {
    const results: Array<Record<string, unknown>> = [];

    for (const pid of publicIds) {
        if (pid && pid.trim()) {
            results.push(await deleteFile(pid, invalidate));
        }
    }

    return results;
}

export async function rename(
    fromPublicId: string,
    toPublicId: string,
    overwrite = false
): Promise<Record<string, unknown>> {
    assertCloudinaryConfigured();

    const res = await cloudinary.uploader.rename(fromPublicId, toPublicId, {
        overwrite,
        invalidate: true,
    });

    return res as unknown as Record<string, unknown>;
}

export async function uploadBufferImage(options: {
    buffer: Buffer;
    folder: string;
    publicId: string;
    maxWidth?: number;
    maxHeight?: number;
}): Promise<UploadApiResponse> {
    assertCloudinaryConfigured();

    const { buffer, folder, publicId, maxWidth = 1600, maxHeight = 1600 } = options;

    return await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                overwrite: true,
                invalidate: true,
                resource_type: "image",
                transformation: [{ width: maxWidth, height: maxHeight, crop: "limit" }],
            },
            (err, result) => {
                if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
                resolve(result);
            }
        );

        stream.end(buffer);
    });
}

export { cloudinary };