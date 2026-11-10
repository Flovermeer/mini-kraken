import { Component } from '@angular/core';
import { IonButton, IonContent, IonHeader, IonMenu, IonMenuToggle, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-layout-menu',
  templateUrl: './layout-menu.component.html',
  styleUrls: ['./layout-menu.component.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonMenu, IonMenuToggle, IonButton],
})
export class LayoutMenuComponent {}
