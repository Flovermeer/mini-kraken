import { Component } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';


@Component({
  selector: 'app-page',
  templateUrl: './app-page.component.html',
  styleUrls: ['./app-page.component.scss'],
  imports: [IonHeader, IonTitle, IonToolbar, IonContent, IonButtons, IonBackButton],
})
export class AppPageComponent {}
