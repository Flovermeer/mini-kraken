import { Component } from '@angular/core';
import { IonApp, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuToggle, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular';

import { LayoutMenuComponent } from './features/layout/components/layout-menu/layout-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonRouterOutlet,








  ],
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {}
}
