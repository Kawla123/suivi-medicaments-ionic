import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';  // ← Ajouter RouterModule
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MedicationService } from '../../services/medication.service';
import { Medication } from '../../models/user.model';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.page.html',
  styleUrls: ['./patient-dashboard.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule,
    RouterModule  // ← Ajouter RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientDashboardPage implements OnInit, OnDestroy {
  
  userName: string = '';
  medications: Medication[] = [];
  medicationsCount: number = 0;
  patientId: string = '';
  
  private medicationsSub?: Subscription;

  constructor(
    private authService: AuthService,
    private medicationService: MedicationService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    this.loadMedications();
  }

  ngOnDestroy() {
    if (this.medicationsSub) {
      this.medicationsSub.unsubscribe();
    }
  }

  async loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientId = user.uid;
      const userData = await this.authService.getUserData(user.uid);
      if (userData) {
        this.userName = userData['name'];
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadMedications() {
    this.medicationsSub = this.medicationService.getPatientMedications(this.patientId).subscribe(
      (medications) => {
        this.medications = medications;
        this.medicationsCount = medications.length;
      },
      (error) => {
        console.error('Erreur lors du chargement des médicaments:', error);
        this.showAlert('Erreur', 'Impossible de charger vos médicaments');
      }
    );
  }

  async addMedication() {
    const alert = await this.alertCtrl.create({
      header: 'Ajouter un médicament',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nom du médicament'
        },
        {
          name: 'dosage',
          type: 'text',
          placeholder: 'Dosage (ex: 500mg)'
        },
        {
          name: 'frequency',
          type: 'text',
          placeholder: 'Fréquence (ex: 3 fois par jour)'
        },
        {
          name: 'hours',
          type: 'text',
          placeholder: 'Heures (ex: 08:00, 14:00, 20:00)'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Ajouter',
          handler: async (data) => {
            if (data.name && data.dosage && data.frequency && data.hours) {
              try {
                const medication: Medication = {
                  patientId: this.patientId,
                  name: data.name,
                  dosage: data.dosage,
                  frequency: data.frequency,
                  hours: data.hours.split(',').map((h: string) => h.trim()),
                  startDate: new Date().toISOString(),
                  createdAt: new Date().toISOString()
                };
                
                await this.medicationService.addMedication(medication);
                this.showAlert('Succès', 'Médicament ajouté avec succès');
              } catch (error) {
                this.showAlert('Erreur', 'Impossible d\'ajouter le médicament');
              }
            } else {
              this.showAlert('Erreur', 'Veuillez remplir tous les champs');
              return false;
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteMedication(medicationId: string | undefined) {
    if (!medicationId) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer ce médicament ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.medicationService.deleteMedication(medicationId);
              this.showAlert('Succès', 'Médicament supprimé');
            } catch (error) {
              this.showAlert('Erreur', 'Impossible de supprimer le médicament');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Déconnexion',
          handler: async () => {
            await this.authService.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
