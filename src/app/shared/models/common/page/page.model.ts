import { SortModel } from './sort.model';

export interface PageModel<T> {
    page: any,
    content: T[];
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    sort: SortModel;
    empty: boolean;
}
export interface PageFilterBase {
    page: number;
    itemsPorPagina: number;
}
