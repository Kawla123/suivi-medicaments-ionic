import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MedicationService } from '../../services/medication.service';
import { MedicationTakeService } from '../../services/medication-take.service';
import { Medication } from '../../models/user.model';
import { MedicationTake } from '../../models/medication-take.model';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.page.html',
  styleUrls: ['./patient-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientDashboardPage implements OnInit, OnDestroy {
  
  // ✅ UTILISER inject() au lieu du constructor
  private authService = inject(AuthService);
  private medicationService = inject(MedicationService);
  private takeService = inject(MedicationTakeService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  
  userName: string = '';
  medications: Medication[] = [];
  medicationsCount: number = 0;
  patientId: string = '';
  takesStatus: Map<string, any> = new Map();
  viewMode: 'today' | 'history' = 'today';
  historyByDate: { date: string; takes: MedicationTake[] }[] = [];

  private medicationsSub?: Subscription;
  private takesSub?: Subscription;
  private historySub?: Subscription;

  // ✅ Constructor vide
  constructor() {}

  async ngOnInit() {
    await this.loadUserData();
    this.loadMedications();
    this.loadTodayTakes();
    this.loadHistory();
  }

  ngOnDestroy() {
    if (this.medicationsSub) this.medicationsSub.unsubscribe();
    if (this.takesSub) this.takesSub.unsubscribe();
    if (this.historySub) this.historySub.unsubscribe();
  }

  async loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientId = user.uid;
      const userData = await this.authService.getUserData(user.uid) as any;
      
      if (userData) {
        this.userName = userData.name || 'Patient';
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadMedications() {
    if (!this.patientId) return;

    this.medicationsSub = this.medicationService.getPatientMedications(this.patientId).subscribe(
      (medications) => {
        this.medications = medications;
        this.medicationsCount = medications.length;
      },
      (error) => console.error('Erreur chargement médicaments:', error)
    );
  }

  loadTodayTakes() {
    if (!this.patientId) return;

    this.takesSub = this.takeService.getTodayTakes(this.patientId).subscribe(
      (takes) => {
        this.takesStatus.clear();
        takes.forEach(take => {
          const key = `${take.medicationId}_${take.scheduledTime}`;
          this.takesStatus.set(key, take.status);
        });
      }
    );
  }

  loadHistory() {
    if (!this.patientId) return;

    const today = new Date().toISOString().split('T')[0];

    this.historySub = this.takeService.getPatientTakes(this.patientId).subscribe(takes => {
      const past = takes
        .filter(take => take.scheduledDate < today)
        .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate) || b.scheduledTime.localeCompare(a.scheduledTime));

      const byDate = new Map<string, MedicationTake[]>();
      past.forEach(take => {
        const list = byDate.get(take.scheduledDate) || [];
        list.push(take);
        byDate.set(take.scheduledDate, list);
      });

      this.historyByDate = Array.from(byDate.entries()).map(([date, dateTakes]) => ({ date, takes: dateTakes }));
    });
  }

  setViewMode(mode: 'today' | 'history') {
    this.viewMode = mode;
  }

  getTakeStatus(medicationId: string | undefined, hour: string): string {
    if (!medicationId) return 'pending';
    const key = `${medicationId}_${hour}`;
    return this.takesStatus.get(key) || 'pending';
  }

  async markAsTaken(medication: Medication, hour: string) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await this.takeService.markAsTaken(
        medication.id || '',
        medication.name,
        this.patientId,
        hour,
        today
      );
      this.showToast('✅ Médicament marqué comme pris', 'success');
    } catch (error) {
      this.showToast('Erreur lors de l\'enregistrement', 'danger');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  async addMedication() {
    const alert = await this.alertCtrl.create({
      header: 'Nouveau médicament',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nom (ex: Doliprane)' },
        { name: 'dosage', type: 'text', placeholder: 'Dosage (ex: 1000mg)' },
        { name: 'frequency', type: 'text', placeholder: 'Fréquence (ex: Matin/Soir)' },
        { name: 'hours', type: 'text', placeholder: 'Heures (ex: 08:00, 20:00)' }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Ajouter',
          handler: async (data) => {
            if (data.name && data.dosage) {
              try {
                const newMed: Medication = {
                  patientId: this.patientId,
                  name: data.name,
                  dosage: data.dosage,
                  frequency: data.frequency || '',
                  hours: data.hours ? data.hours.split(',').map((h: string) => h.trim()) : [],
                  startDate: new Date().toISOString(),
                  createdAt: new Date().toISOString()
                };
                
                await this.medicationService.addMedication(newMed);
                this.showToast('Médicament ajouté', 'success');
                return true;
              } catch (e) {
                this.showToast('Échec de l\'ajout', 'danger');
                return false;
              }
            } else {
              this.showToast('Nom et dosage requis', 'warning');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async editMedication(medication: Medication) {
    const alert = await this.alertCtrl.create({
      header: 'Modifier le médicament',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nom', value: medication.name },
        { name: 'dosage', type: 'text', placeholder: 'Dosage', value: medication.dosage },
        { name: 'frequency', type: 'text', placeholder: 'Fréquence', value: medication.frequency },
        { name: 'hours', type: 'text', placeholder: 'Heures (ex: 08:00, 20:00)', value: medication.hours.join(', ') }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Enregistrer',
          handler: async (data) => {
            if (data.name && data.dosage) {
              try {
                await this.medicationService.updateMedication(medication.id || '', {
                  name: data.name,
                  dosage: data.dosage,
                  frequency: data.frequency || '',
                  hours: data.hours ? data.hours.split(',').map((h: string) => h.trim()) : []
                });
                this.showToast('Médicament modifié', 'success');
                return true;
              } catch (e) {
                this.showToast('Échec de la modification', 'danger');
                return false;
              }
            } else {
              this.showToast('Nom et dosage requis', 'warning');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteMedication(medicationId: string | undefined) {
    if (!medicationId) return;

    const alert = await this.alertCtrl.create({
      header: 'Supprimer ?',
      message: 'Êtes-vous sûr de vouloir supprimer ce médicament ?',
      buttons: [
        { text: 'Non', role: 'cancel' },
        {
          text: 'Oui',
          role: 'destructive',
          handler: async () => {
            try {
              await this.medicationService.deleteMedication(medicationId);
              this.showToast('Médicament supprimé', 'success');
            } catch (e) {
              this.showToast('Impossible de supprimer', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.authService.logout();
  }
}
