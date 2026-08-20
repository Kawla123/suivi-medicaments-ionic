import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MedicationService } from '../../services/medication.service';

@Component({
  selector: 'app-aidant-dashboard',
  templateUrl: './aidant-dashboard.page.html',
  styleUrls: ['./aidant-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AidantDashboardPage implements OnInit, OnDestroy {

  userName: string = '';
  patients: any[] = [];
  medicationsCount: number = 0;

  private medicationsSub?: Subscription;

  constructor(
    private authService: AuthService,
    private medicationService: MedicationService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    this.loadPatients();
    this.loadMedicationsCount();
  }

  ngOnDestroy() {
    if (this.medicationsSub) this.medicationsSub.unsubscribe();
  }

  loadMedicationsCount() {
    this.medicationsSub = this.medicationService.getAllMedications().subscribe(
      (medications) => this.medicationsCount = medications.length
    );
  }

  async loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      // ✅ Ajout de "as any" pour éviter l'erreur TypeScript
      const userData = await this.authService.getUserData(user.uid) as any;
      
      if (userData) {
        this.userName = userData.name || 'Aidant';
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadPatients() {
    this.authService.getAllPatients().subscribe(
      (data) => {
        this.patients = data;
        console.log('Patients chargés:', this.patients);
      },
      (error) => {
        console.error('Erreur chargement patients:', error);
      }
    );
  }

  viewPatientDetails(patient: any) {
    if (patient && patient.uid) {
      console.log('Navigation vers patient:', patient);
      this.router.navigate(['/patient-details', patient.uid]);
    } else {
      console.error('Patient sans UID:', patient);
    }
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
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
}
