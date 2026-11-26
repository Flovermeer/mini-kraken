import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, minLength, applyWhenValue } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { PlacesService } from '@api';
import { IonButton, IonCard, IonCardContent, IonInput } from '@ionic/angular';

import { AppPageComponent } from '../../app/app-page/app-page.component';

interface CreatePlace {
  name: string|null;
}

@Component({
  selector: 'app-create-place',
  templateUrl: './create-place.component.html',
  styleUrls: ['./create-place.component.scss'],
  imports: [ IonButton, IonInput, IonCardContent, IonCard, FormField, AppPageComponent],
})
export class CreatePlaceComponent {
  private readonly placeService = inject(PlacesService);
  private readonly router = inject(Router);
  protected createPlaceModel = signal<CreatePlace>({
    name: null,
  });
  protected createPlaceForm = form(this.createPlaceModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Le nom est requis' });
    applyWhenValue(
      schemaPath.name,
      (val): val is string => val !== null,
      (bioPath) =>
        minLength(bioPath, 3, {
          message: 'Le nom doit contenir au minimum 3 lettres',
        }),
    );
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.createPlaceForm().valid()) return;
    const place = this.placeService.createPlace({ name: this.createPlaceModel().name! });
    place.subscribe({
      next: async (value) => {
        await this.router.navigate([`/${value.id}`]);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
