import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCard, IonCardContent, IonCardTitle,
  IonCardSubtitle, IonList, IonItem, IonIcon, IonLabel
} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCard,
    RouterLink,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
  ],
})
export class HomePage {
  constructor() {}
}
