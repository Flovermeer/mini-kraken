import type { InputSignal } from '@angular/core';
import { input, Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import type { Place } from '@api';
import { IonButton, IonCard, IonItem, IonList } from '@ionic/angular';

import { AppPageComponent } from '../../app/app-page/app-page.component';

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.component.html',
  styleUrls: ['./place-details.component.scss'],
  imports: [AppPageComponent, IonButton, IonCard, IonList, IonItem, RouterLink],
})
export class PlaceDetailsComponent {
  protected readonly place: InputSignal<Place> = input.required<Place>();
}
