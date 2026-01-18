// Interface définissant la structure d'un utilisateur
export interface User {
  uid: string;                    // Identifiant unique Firebase
  email: string;                  // Email de l'utilisateur
  name: string;                   // Nom complet
  role: 'patient' | 'aidant';     // Rôle : patient ou aidant
  createdAt: string;              // Date de création du compte
  photoURL?: string;              // URL de la photo de profil (optionnel)
  phoneNumber?: string;           // Numéro de téléphone (optionnel)
}

// Interface pour un médicament
export interface Medication {
  id?: string;                    // ID auto-généré par Firebase
  patientId: string;              // ID du patient concerné
  name: string;                   // Nom du médicament
  dosage: string;                 // Dosage (ex: "500mg")
  frequency: string;              // Fréquence (ex: "3 fois par jour")
  hours: string[];                // Heures de prise (ex: ["08:00", "14:00", "20:00"])
  startDate: string;              // Date de début du traitement
  endDate?: string;               // Date de fin (optionnel)
  notes?: string;                 // Notes additionnelles
  imageUrl?: string;              // Photo du médicament
  createdAt: string;              // Date d'ajout
}

// Interface pour une prise de médicament
export interface MedicationTake {
  id?: string;                    // ID auto-généré
  medicationId: string;           // Référence au médicament
  patientId: string;              // ID du patient
  scheduledTime: string;          // Heure prévue
  takenTime?: string;             // Heure réelle de prise
  status: 'pending' | 'taken' | 'missed';  // Statut de la prise
  notes?: string;                 // Notes (ex: "Pris avec du lait")
}
