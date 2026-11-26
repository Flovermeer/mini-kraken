import { Component } from '@angular/core';
import { IonRouterOutlet } from "@ionic/angular";
import { addIcons } from 'ionicons';
import { menuOutline} from 'ionicons/icons';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [
    IonRouterOutlet,
  ],
})
export class LayoutComponent {
  constructor() {
    addIcons({ menuOutline });
  }
}
