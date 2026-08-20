import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { from, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Empêche un utilisateur déjà connecté de revoir les pages login/register : renvoie vers son tableau de bord.
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    switchMap(user => {
      if (!user) return of(true);
      return from(authService.getUserRole(user.uid)).pipe(
        map(role => router.createUrlTree([role === 'aidant' ? '/aidant-dashboard' : '/patient-dashboard']))
      );
    })
  );
};

// Vérifie que l'utilisateur connecté a bien le rôle attendu pour cette route (patient / aidant).
export const roleGuard = (expectedRole: 'patient' | 'aidant'): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const authService = inject(AuthService);
    const router = inject(Router);

    return authState(auth).pipe(
      take(1),
      switchMap(user => {
        if (!user) return of(router.createUrlTree(['/login']));
        return from(authService.getUserRole(user.uid)).pipe(
          map(role => {
            if (role === expectedRole) return true;
            if (role === 'patient') return router.createUrlTree(['/patient-dashboard']);
            if (role === 'aidant') return router.createUrlTree(['/aidant-dashboard']);
            return router.createUrlTree(['/login']);
          })
        );
      })
    );
  };
};
