export interface MedicationTake {
  id?: string;
  medicationId: string;
  medicationName: string;
  patientId: string;
  scheduledTime: string; // Format: "08:00"
  scheduledDate: string; // Format: "2026-01-20"
  takenAt?: string; // Timestamp ISO quand le médicament a été pris
  status: 'pending' | 'taken' | 'missed'; // En attente, Pris, Manqué
  takenBy?: 'patient' | 'aidant'; // Qui a marqué la prise
  createdAt: string;
}
