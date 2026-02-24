export type ApiErrorCode =
    | "VALIDATION_ERROR"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "BAD_REQUEST"
    | "INTERNAL_ERROR";

export class ApiError extends Error {
    status: number;
    code: ApiErrorCode;
    details?: unknown;

    constructor(params: { status: number; code: ApiErrorCode; message: string; details?: unknown }) {
        super(params.message);
        this.status = params.status;
        this.code = params.code;
        this.details = params.details;
    }
}

export const Errors = {
    badRequest: (message: string, details?: unknown) =>
        new ApiError({ status: 400, code: "BAD_REQUEST", message, details }),

    unauthorized: (message = "Unauthorized", details?: unknown) =>
        new ApiError({ status: 401, code: "UNAUTHORIZED", message, details }),

    forbidden: (message = "Forbidden", details?: unknown) =>
        new ApiError({ status: 403, code: "FORBIDDEN", message, details }),

    notFound: (message = "Not found", details?: unknown) =>
        new ApiError({ status: 404, code: "NOT_FOUND", message, details }),

    conflict: (message = "Conflict", details?: unknown) =>
        new ApiError({ status: 409, code: "CONFLICT", message, details }),

    internal: (message = "Internal server error", details?: unknown) =>
        new ApiError({ status: 500, code: "INTERNAL_ERROR", message, details }),
};