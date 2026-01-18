import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';  // ← Ajouter RouterModule
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule,
    RouterModule  // ← Ajouter RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegisterPage {
  
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: 'patient' | 'aidant' | '' = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async register() {
    
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.role) {
      this.showAlert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showAlert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showAlert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    if (this.password.length < 6) {
      this.showAlert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Création du compte...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.authService.register(
        this.email, 
        this.password, 
        this.name, 
        this.role as 'patient' | 'aidant'
      );
      
      await loading.dismiss();
      
      const alert = await this.alertCtrl.create({
        header: 'Succès',
        message: 'Votre compte a été créé avec succès ! Connectez-vous maintenant.',
        buttons: [{
          text: 'OK',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }]
      });
      await alert.present();
      
    } catch (error: any) {
      await loading.dismiss();
      this.showAlert('Erreur d\'inscription', error);
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
