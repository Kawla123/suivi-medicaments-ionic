import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.page.html',
  styleUrls: ['./patient-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PatientDetailsPage implements OnInit {
  
  // ✅ Injection correcte pour éviter l'erreur de dépendance circulaire
  private db = inject(AngularFireDatabase);
  
  patientUid: string = '';
  patientName: string = '';
  patientEmail: string = '';
  medicaments: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.patientUid = this.route.snapshot.paramMap.get('uid') || '';
    
    if (this.patientUid) {
      this.loadPatientInfo();
      this.loadMedicaments();
    }
  }

  loadPatientInfo() {
    this.db.object(`/users/${this.patientUid}`).valueChanges().subscribe((data: any) => {
      if (data) {
        this.patientName = data.name;
        this.patientEmail = data.email;
      }
    });
  }

  loadMedicaments() {
    this.db.list(`/medicaments/${this.patientUid}`).snapshotChanges().subscribe(actions => {
      this.medicaments = actions.map(action => ({
        key: action.payload.key,
        ...action.payload.val() as any
      }));
    });
  }

  async ajouterMedicament() {
    const alert = await this.alertCtrl.create({
      header: 'Ajouter un médicament',
      inputs: [
        {
          name: 'nom',
          type: 'text',
          placeholder: 'Nom du médicament'
        },
        {
          name: 'dosage',
          type: 'text',
          placeholder: 'Dosage (ex: 500mg)'
        },
        {
          name: 'frequence',
          type: 'text',
          placeholder: 'Fréquence (ex: 3x/jour)'
        },
        {
          name: 'heures',
          type: 'text',
          placeholder: 'Heures (ex: 08:00, 14:00, 20:00)'
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Ajouter',
          handler: (data) => {
            if (data.nom && data.dosage && data.frequence) {
              this.saveMedicament(data);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  saveMedicament(data: any) {
    const medicamentData = {
      nom: data.nom,
      dosage: data.dosage,
      frequence: data.frequence,
      heures: data.heures || '',
      dateAjout: new Date().toISOString(),
      ajoutePar: 'aidant'
    };

    this.db.list(`/medicaments/${this.patientUid}`).push(medicamentData)
      .then(() => {
        this.showToast('Médicament ajouté avec succès !');
      })
      .catch(error => {
        console.error('Erreur:', error);
        this.showToast('Erreur lors de l\'ajout');
      });
  }

  async supprimerMedicament(key: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer',
      message: 'Voulez-vous vraiment supprimer ce médicament ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          handler: () => {
            this.db.list(`/medicaments/${this.patientUid}`).remove(key)
              .then(() => {
                this.showToast('Médicament supprimé');
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/aidant-dashboard']);
  }
}
