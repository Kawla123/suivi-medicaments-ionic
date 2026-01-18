import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aidant-dashboard',
  templateUrl: './aidant-dashboard.page.html',
  styleUrls: ['./aidant-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AidantDashboardPage implements OnInit {
  
  userName: string = '';
  patients: any[] = []; 
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    this.loadPatients();
  }

  async loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      const userData = await this.authService.getUserData(user.uid);
      if (userData) {
        this.userName = userData['name'];
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
