import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { MedicationTake } from '../models/medication-take.model';

@Injectable({
  providedIn: 'root'
})
export class MedicationTakeService {

  constructor(private db: AngularFireDatabase) {}

  async markAsTaken(
    medicationId: string,
    medicationName: string,
    patientId: string,
    scheduledTime: string,
    scheduledDate: string
  ): Promise<void> {
    const take: MedicationTake = {
      medicationId,
      medicationName,
      patientId,
      scheduledTime,
      scheduledDate,
      takenAt: new Date().toISOString(),
      status: 'taken',
      takenBy: 'patient',
      createdAt: new Date().toISOString()
    };

    const key = `${medicationId}_${scheduledDate}_${scheduledTime}`;
    await this.db.object(`takes/${patientId}/${key}`).set(take);
  }

  async markAsMissed(
    medicationId: string,
    medicationName: string,
    patientId: string,
    scheduledTime: string,
    scheduledDate: string
  ): Promise<void> {
    const take: MedicationTake = {
      medicationId,
      medicationName,
      patientId,
      scheduledTime,
      scheduledDate,
      status: 'missed',
      takenBy: 'patient',
      createdAt: new Date().toISOString()
    };

    const key = `${medicationId}_${scheduledDate}_${scheduledTime}`;
    await this.db.object(`takes/${patientId}/${key}`).set(take);
  }

  getPatientTakes(patientId: string): Observable<MedicationTake[]> {
    return new Observable(observer => {
      this.db.list(`takes/${patientId}`).snapshotChanges().subscribe(actions => {
        const takes = actions.map(action => ({
          id: action.payload.key || undefined,  // ✅ CORRECTION ICI
          ...action.payload.val() as MedicationTake
        })) as MedicationTake[];  // ✅ ET ICI
        observer.next(takes);
      });
    });
  }

  getTakeStatus(
    patientId: string,
    medicationId: string,
    scheduledDate: string,
    scheduledTime: string
  ): Observable<MedicationTake | null> {
    const key = `${medicationId}_${scheduledDate}_${scheduledTime}`;
    return new Observable(observer => {
      this.db.object(`takes/${patientId}/${key}`).valueChanges().subscribe((data: any) => {
        observer.next(data || null);
      });
    });
  }

  getTodayTakes(patientId: string): Observable<MedicationTake[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return new Observable(observer => {
      this.db.list(`takes/${patientId}`, ref => 
        ref.orderByChild('scheduledDate').equalTo(today)
      ).snapshotChanges().subscribe(actions => {
        const takes = actions.map(action => ({
          id: action.payload.key || undefined,  // ✅ CORRECTION ICI
          ...action.payload.val() as MedicationTake
        })) as MedicationTake[];  // ✅ ET ICI
        observer.next(takes);
      });
    });
  }
}
