import { Injectable } from '@angular/core';

const KEY = 'snapshotPuntosRecepcion';

@Injectable({ providedIn: 'root' })
export class SnapshotService {
    save(data: unknown): void {
        sessionStorage.setItem(KEY, JSON.stringify(data));
    }

    load<T = any>(): T | null {
        const raw = sessionStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as T) : null;
    }

    clear(): void {
        sessionStorage.removeItem(KEY);
    }
}
