import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';  // ← Ajouter RouterModule ici
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule,
    RouterModule  // ← IMPORTANT : Ajouter RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPage {
  
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async login() {
    
    if (!this.email || !this.password) {
      this.showAlert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showAlert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Connexion en cours...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.authService.login(this.email, this.password);
      await loading.dismiss();
    } catch (error: any) {
      await loading.dismiss();
      this.showAlert('Erreur de connexion', error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
