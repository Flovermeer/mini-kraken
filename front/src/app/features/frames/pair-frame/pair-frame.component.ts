import { Component, inject, input, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import {Router} from "@angular/router";
import type { DiscoveredDevice, PairDeviceRequest } from '@api';
import { DevicesService } from '@api';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonModal, IonSpinner, IonTitle } from '@ionic/angular';
import { interval, Subscription, switchMap, take } from 'rxjs';

import { AppPageComponent } from '../../app/app-page/app-page.component';

@Component({
  selector: 'app-pair-frame',
  templateUrl: './pair-frame.component.html',
  styleUrls: ['./pair-frame.component.scss'],
  imports: [
    AppPageComponent,
    IonButton,
    IonLabel,
    IonList,
    IonItem,
    IonSpinner,
    IonModal,
    IonContent,
    IonInput,
    IonTitle,
    FormField,
  ],
})
export class PairFrameComponent {
  private readonly router = inject(Router);
  private readonly devicesService = inject(DevicesService);
  protected readonly id = input.required<string>();
  protected readonly discoveredDevices = signal<DiscoveredDevice[]>([]);
  protected readonly isDiscoveringDevices = signal<boolean>(false);
  protected readonly selectedDevice = signal<DiscoveredDevice | null>(null);
  protected readonly isFormModalOpen = signal<boolean>(false);
  private discoveringSubscription: Subscription = new Subscription();

  protected pairDeviceModel = signal<{ name: string | null }>({ name: null });
  protected pairDeviceForm = form(this.pairDeviceModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Le nom est requis ' });
  });

  protected openFormModal(device: DiscoveredDevice): void {
    this.selectedDevice.set(device);
    this.isFormModalOpen.set(true);
  }

  protected dismissFormModal(): void {
    this.selectedDevice.set(null);
    this.isFormModalOpen.set(false);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.selectedDevice()) { return; }
    if (!this.pairDeviceForm().valid()) { return; }

    console.log('ok');
    const request: PairDeviceRequest = {
      id: this.selectedDevice()!.id,
      name: this.pairDeviceForm.name().value()!,
      placeId: this.id()
    };
    const paired = this.devicesService.pairDevice(request);
    paired.subscribe({
      next: async (_value) => {
        console.log("device paired");
        this.selectedDevice.set(null);
        this.isFormModalOpen.set(false);
        await this.router.navigate([`/${this.id()}`]);
      },
      error: error => console.error(error)
    });
  }

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
