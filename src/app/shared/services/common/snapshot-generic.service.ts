import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SnapshotGenericService {
    save(key: string, data: unknown): void {

        sessionStorage.setItem(key, JSON.stringify(data));
    }

    load<T = any>(key: string): T | null {
        const raw = sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    }

    clear(key: string): void {
        sessionStorage.removeItem(key);
    }
}
