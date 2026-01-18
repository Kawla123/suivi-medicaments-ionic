import { Injectable } from '@angular/core';
import { Database, ref, push, set, remove, onValue, query, orderByChild, equalTo } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { Medication, MedicationTake } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  constructor(private database: Database) {}

  /**
   * Ajouter un nouveau médicament pour un patient
   * @param medication - Objet contenant les informations du médicament
   */
  async addMedication(medication: Medication): Promise<string> {
    try {
      // Créer une référence avec un ID auto-généré
      const medicationsRef = ref(this.database, 'medications');
      const newMedicationRef = push(medicationsRef);
      
      // Ajouter la date de création
      const medicationData = {
        ...medication,
        createdAt: new Date().toISOString()
      };
      
      // Sauvegarder dans la base de données
      await set(newMedicationRef, medicationData);
      
      // Retourner l'ID généré
      return newMedicationRef.key || '';
    } catch (error) {
      console.error('Erreur lors de l\'ajout du médicament:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les médicaments d'un patient en temps réel
   * @param patientId - ID du patient
   */
  getPatientMedications(patientId: string): Observable<Medication[]> {
    return new Observable(observer => {
      const medicationsRef = ref(this.database, 'medications');
      const patientQuery = query(medicationsRef, orderByChild('patientId'), equalTo(patientId));
      
      // Écouter les changements en temps réel
      const unsubscribe = onValue(patientQuery, (snapshot) => {
        const medications: Medication[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const medication = childSnapshot.val();
          medications.push({
            id: childSnapshot.key || '',
            ...medication
          });
        });
        
        observer.next(medications);
      }, (error) => {
        observer.error(error);
      });
      
      // Fonction de nettoyage appelée lors du unsubscribe
      return () => unsubscribe();
    });
  }

  /**
   * Récupérer un médicament spécifique
   * @param medicationId - ID du médicament
   */
  getMedicationById(medicationId: string): Observable<Medication | null> {
    return new Observable(observer => {
      const medicationRef = ref(this.database, `medications/${medicationId}`);
      
      const unsubscribe = onValue(medicationRef, (snapshot) => {
        if (snapshot.exists()) {
          observer.next({
            id: snapshot.key || '',
            ...snapshot.val()
          });
        } else {
          observer.next(null);
        }
      }, (error) => {
        observer.error(error);
      });
      
      return () => unsubscribe();
    });
  }

  /**
   * Supprimer un médicament
   * @param medicationId - ID du médicament à supprimer
   */
  async deleteMedication(medicationId: string): Promise<void> {
    try {
      const medicationRef = ref(this.database, `medications/${medicationId}`);
      await remove(medicationRef);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  /**
   * Ajouter une prise de médicament
   * @param take - Objet contenant les informations de la prise
   */
  async addMedicationTake(take: MedicationTake): Promise<string> {
    try {
      const takesRef = ref(this.database, 'medication-takes');
      const newTakeRef = push(takesRef);
      
      await set(newTakeRef, take);
      return newTakeRef.key || '';
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la prise:', error);
      throw error;
    }
  }

  /**
   * Marquer une prise comme effectuée
   * @param takeId - ID de la prise
   */
  async markAsTaken(takeId: string): Promise<void> {
    try {
      const takeRef = ref(this.database, `medication-takes/${takeId}`);
      await set(takeRef, {
        status: 'taken',
        takenTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique des prises d'un patient
   * @param patientId - ID du patient
   */
  getPatientHistory(patientId: string): Observable<MedicationTake[]> {
    return new Observable(observer => {
      const takesRef = ref(this.database, 'medication-takes');
      const patientQuery = query(takesRef, orderByChild('patientId'), equalTo(patientId));
      
      const unsubscribe = onValue(patientQuery, (snapshot) => {
        const takes: MedicationTake[] = [];
        
        snapshot.forEach((childSnapshot) => {
          takes.push({
            id: childSnapshot.key || '',
            ...childSnapshot.val()
          });
        });
        
        observer.next(takes);
      }, (error) => {
        observer.error(error);
      });
      
      return () => unsubscribe();
    });
  }
}
