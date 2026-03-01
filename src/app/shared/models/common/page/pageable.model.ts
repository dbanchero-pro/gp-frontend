export interface PageableModel {
    sort: string;
    order: 'asc' | 'desc';
    offset: number;
    pageSize: number;
    pageNumber: number;
    unpaged: boolean;
    paged: boolean;
}
