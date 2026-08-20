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
