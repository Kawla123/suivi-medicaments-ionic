import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser, 
  onAuthStateChanged 
} from '@angular/fire/auth';
import { Database, ref, set, get, child, onValue, DataSnapshot } from '@angular/fire/database';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // Observable pour suivre l'état de connexion de l'utilisateur
  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public currentUser$: Observable<FirebaseUser | null> = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private database: Database,
    private router: Router
  ) {
    // Écouter les changements d'état d'authentification Firebase
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  /**
   * Inscription d'un nouvel utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @param name - Nom complet
   * @param role - Rôle (patient ou aidant)
   */
  async register(email: string, password: string, name: string, role: 'patient' | 'aidant') {
    try {
      // Créer le compte dans Firebase Authentication
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = credential.user.uid;
      
      // Sauvegarder les informations supplémentaires dans Realtime Database
      const userRef = ref(this.database, `users/${uid}`);
      await set(userRef, {
        uid: uid,
        email: email,
        name: name,
        role: role,
        createdAt: new Date().toISOString(),
        photoURL: '',
        phoneNumber: ''
      });
      
      return credential;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Connexion d'un utilisateur existant
   * @param email - Email
   * @param password - Mot de passe
   */
  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Récupérer le rôle de l'utilisateur et rediriger
      const role = await this.getUserRole(credential.user.uid);
      
      if (role === 'patient') {
        this.router.navigate(['/patient-dashboard']);
      } else if (role === 'aidant') {
        this.router.navigate(['/aidant-dashboard']);
      }
      
      return credential;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer le rôle d'un utilisateur depuis la base de données
   * @param uid - ID de l'utilisateur
   */
  async getUserRole(uid: string): Promise<string> {
    try {
      const dbRef = ref(this.database);
      const snapshot = await get(child(dbRef, `users/${uid}`));
      
      if (snapshot.exists()) {
        return snapshot.val().role;
      }
      return '';
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      return '';
    }
  }
  
  /**
   * Récupérer tous les patients inscrits
   */
  getAllPatients(): Observable<any[]> {
    return new Observable((observer) => {
      const dbRef = ref(this.database);
      const usersRef = child(dbRef, 'users');
      
      const unsubscribe = onValue(usersRef, (snapshot: DataSnapshot) => {
        const patients: any[] = [];
        
        snapshot.forEach((childSnapshot: any) => {
          const user = childSnapshot.val();
          if (user && user.role === 'patient') {
            patients.push(user);
          }
        });
        
        observer.next(patients);
      });
      
      return () => unsubscribe();
    });
  }

  /**
   * Récupérer les données complètes d'un utilisateur
   * @param uid - ID de l'utilisateur
   */
  async getUserData(uid: string) {
    try {
      const dbRef = ref(this.database);
      const snapshot = await get(child(dbRef, `users/${uid}`));
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return null;
    }
  }

  /**
   * Obtenir l'utilisateur actuellement connecté
   */
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  /**
   * Gérer les erreurs Firebase et retourner des messages en français
   */
  private handleError(error: any): string {
    let message = 'Une erreur est survenue';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Cet email est déjà utilisé';
        break;
      case 'auth/invalid-email':
        message = 'Email invalide';
        break;
      case 'auth/weak-password':
        message = 'Mot de passe trop faible (minimum 6 caractères)';
        break;
      case 'auth/user-not-found':
        message = 'Aucun compte trouvé avec cet email';
        break;
      case 'auth/wrong-password':
        message = 'Mot de passe incorrect';
        break;
      case 'auth/invalid-credential':
        message = 'Email ou mot de passe incorrect';
        break;
      default:
        message = error.message;
    }
    
    return message;
  }
}
