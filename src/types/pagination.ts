export type PaginatedResult<T> = {
    page: number;
    limit: number;
    total: number;
    items: T[];
};