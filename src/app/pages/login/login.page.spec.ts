import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';  // ← Ajouter CUSTOM_ELEMENTS_SCHEMA
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // ← AJOUTER CETTE LIGNE
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

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
