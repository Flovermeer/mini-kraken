import type { ElementRef} from '@angular/core';
import { output, signal, viewChild, Component, inject, input, model } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { PhotosService, BASE_PATH } from '@api';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonModal, IonSpinner, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-photo-gallery-modal',
  templateUrl: './photo-gallery-modal.component.html',
  styleUrls: ['./photo-gallery-modal.component.scss'],
  imports: [IonModal, IonHeader, IonButtons, IonButton, IonToolbar, IonContent, IonFooter, IonIcon, IonSpinner],
})
export class PhotoGalleryModalComponent {
  private readonly basePath = inject(BASE_PATH);
  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotosService);
  private readonly deviceId = this.route.snapshot.params['deviceId'];
  readonly isOpen = model<boolean>(false);
  readonly selectedPhotoId = model.required<string | null>();
  readonly photoIds = input.required<string[]>();
  photoDeleted = output<void>();
  protected readonly isPositioned = signal<boolean>(false);
  protected readonly isLoading = signal<boolean>(false);

  private readonly strip = viewChild<ElementRef<HTMLDivElement>>('strip');

  private getActivePhotoId(): string|null {
    const clientWidth = this.strip()?.nativeElement.clientWidth;
    const scrollLeft = this.strip()?.nativeElement.scrollLeft;
    if (!clientWidth || scrollLeft === undefined) {
      return null;
    }
    const idx = Math.round(scrollLeft / clientWidth);
    return this.photoIds()[idx];
  };

  constructor() {
    addIcons({ trash });
  }

  protected removePhoto(): void {
    const photoId = this.getActivePhotoId();
    if (!photoId) {
      return;
    }
    this.isLoading.set(true);
    this.photoService
      .removePhotoById(this.deviceId, photoId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.photoDeleted.emit(),
      });
  }

  protected photoLink(photoId: string = this.selectedPhotoId()!): string {
    return `${this.basePath}/devices/${this.deviceId}/photos/${photoId}`;
  }

  protected scrollToSelectedPhoto(): void {
    const clientWidth = this.strip()?.nativeElement.clientWidth;
    const idx = this.photoIds().indexOf(this.selectedPhotoId() ?? this.photoIds()[0]);
    if (idx === undefined || !clientWidth) return;
    this.strip()!.nativeElement.scrollLeft = idx * clientWidth!;
    this.isPositioned.set(true);
  }

  protected dismiss(): void {
    this.isPositioned.set(false);
    this.isOpen.set(false);
  }
}
