import { Component, inject, signal } from '@angular/core';
import type { DiscoveredDevice } from '@api';
import { DevicesService } from '@api';
import { IonButton, IonItem, IonLabel, IonList, IonSpinner } from '@ionic/angular';
import { interval, Subscription, switchMap, take } from 'rxjs';

import { AppPageComponent } from '../../app/app-page/app-page.component';

@Component({
  selector: 'app-pair-frame',
  templateUrl: './pair-frame.component.html',
  styleUrls: ['./pair-frame.component.scss'],
  imports: [AppPageComponent, IonButton, IonLabel, IonList, IonItem, IonSpinner],
})
export class PairFrameComponent {
  private readonly devicesService = inject(DevicesService);
  protected readonly discoveredDevices = signal<DiscoveredDevice[]>([]);
  protected readonly isDiscoveringDevices = signal<boolean>(false);
  private discoveringSubscription: Subscription = new Subscription();

  protected startLookingForDevices(): void {
    this.isDiscoveringDevices.set(true);

    this.discoveringSubscription = this.devicesService
      .startDiscoveringDevices()
      .pipe(
        switchMap(() => interval(1000)),
        switchMap(() => this.devicesService.getDiscoveredDevices()),
        take(30),
      )
      .subscribe({
        next: (devices) => this.discoveredDevices.set(devices),
        complete: () => {
          this.isDiscoveringDevices.set(false);
        },
        error: (err) => {
          this.isDiscoveringDevices.set(false);
          console.error(err);
        },
      });
  }

  protected stopLookingForDevices(): void {
    this.discoveringSubscription.unsubscribe();
    this.devicesService.stopDiscoveringDevices().subscribe({
      next: () => {
        this.isDiscoveringDevices.set(false);
      },
      error: (error) => console.error(error),
    });
  }

  ionViewWillLeave(): void {
    this.stopLookingForDevices();
  }
}
