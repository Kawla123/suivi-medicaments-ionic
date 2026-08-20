import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { Medication } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  constructor(private db: AngularFireDatabase) {}

  getPatientMedications(patientId: string): Observable<Medication[]> {
    return new Observable(observer => {
      this.db.list('medicaments', ref => 
        ref.orderByChild('patientId').equalTo(patientId)
      ).snapshotChanges().subscribe(actions => {
        const medications = actions.map(action => ({
          id: action.payload.key || undefined,  // ✅ CORRECTION ICI
          ...action.payload.val() as Medication
        })) as Medication[];  // ✅ ET ICI
        observer.next(medications);
      });
    });
  }

  async addMedication(medication: Medication): Promise<void> {
    try {
      await this.db.list('medicaments').push(medication);
    } catch (error) {
      console.error('Erreur ajout médicament:', error);
      throw error;
    }
  }

  async deleteMedication(medicationId: string): Promise<void> {
    try {
      await this.db.object(`medicaments/${medicationId}`).remove();
    } catch (error) {
      console.error('Erreur suppression:', error);
      throw error;
    }
  }

  getPatientInfo(uid: string): Observable<any> {
    return this.db.object(`users/${uid}`).valueChanges();
  }

  getAllMedications(): Observable<Medication[]> {
    return new Observable(observer => {
      this.db.list('medicaments').snapshotChanges().subscribe(actions => {
        const medications = actions.map(action => ({
          id: action.payload.key || undefined,
          ...action.payload.val() as Medication
        })) as Medication[];
        observer.next(medications);
      });
    });
  }

  async updateMedication(medicationId: string, medication: Partial<Medication>): Promise<void> {
    try {
      await this.db.object(`medicaments/${medicationId}`).update(medication);
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      throw error;
    }
  }
}
