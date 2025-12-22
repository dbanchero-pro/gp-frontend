export interface SortModel {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
}
export interface SortBase {
    sort: string;
    order: 'asc' | 'desc';
}
