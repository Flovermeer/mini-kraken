import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonButton, IonContent, IonFab, IonFabButton, IonHeader, IonIcon,
  IonMenuButton, IonMenuToggle, IonTitle, IonToolbar} from "@ionic/angular";
import { addIcons } from 'ionicons';
import { menuOutline} from 'ionicons/icons';

import { LayoutMenuComponent } from './components/layout-menu/layout-menu.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    RouterOutlet,
    IonFabButton,
    IonFab,
    IonIcon,
    LayoutMenuComponent,
    IonMenuToggle,
    IonButton,
    IonMenuButton,
  ],
})
export class LayoutComponent {
  constructor() {
    addIcons({ menuOutline });
  }
}
