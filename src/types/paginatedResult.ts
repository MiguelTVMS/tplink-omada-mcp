export interface PaginatedResult<T> {
    totalRows?: number;
    currentPage?: number;
    currentSize?: number;
    data?: T[];
}
