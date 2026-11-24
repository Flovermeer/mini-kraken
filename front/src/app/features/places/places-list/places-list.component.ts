import type { InputSignal } from '@angular/core';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Place } from '@api';
import { IonContent, IonItem, IonLabel, IonList } from '@ionic/angular';

import { AppPageComponent } from '../../app/app-page/app-page.component';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss'],
  imports: [IonItem, IonLabel, IonList, RouterLink, AppPageComponent],
})
export class PlacesListComponent {
  protected readonly places: InputSignal<Place[] | undefined> = input<Place[]>();
}
