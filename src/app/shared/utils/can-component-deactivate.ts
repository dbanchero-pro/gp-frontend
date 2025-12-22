// src/app/core/can-deactivate.guard.ts
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  /**
   * Debe retornar true si puede abandonar,
   * o false | Observable<boolean> | Promise<boolean>
   * si debe confirmar.
   */
  canDeactivate: () => boolean | Observable<boolean> | Promise<boolean>;
}
