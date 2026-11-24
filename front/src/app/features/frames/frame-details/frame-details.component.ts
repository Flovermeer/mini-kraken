import type { InputSignal, OnInit } from '@angular/core';
import  { computed, signal, inject, Component, input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Thumbnail } from '@api';
import { PhotosService } from '@api';
import { IonButton, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonProgressBar, IonSpinner } from '@ionic/angular';
import { concatMap, from } from 'rxjs';

import { AppPageComponent } from '../../app/app-page/app-page.component';

@Component({
  selector: 'app-frame-details',
  templateUrl: './frame-details.component.html',
  styleUrls: ['./frame-details.component.scss'],
  imports: [
    AppPageComponent,
    IonButton,
    IonInfiniteScroll,
    IonProgressBar,
    IonSpinner,
    IonContent,
    IonInfiniteScrollContent,
  ],
})
export class FrameDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotosService);
  protected readonly deviceName: string = this.route.snapshot.queryParamMap.get('name') ?? 'Cadre';
  protected readonly thumbnails: InputSignal<Thumbnail[] | undefined> = input<Thumbnail[]>();
  protected isLoading = signal<boolean>(false);
  protected totalPhotosUploaded = signal<number>(1);
  protected photosUploaded = signal<number>(0);
  protected thumbnailsSync = signal<Thumbnail[]>([]);
  protected nextPage = signal<number>(1);
  protected isInfiniteScrollDisabled = signal<boolean>(false);

  protected readonly computedPhotosUploadProgress = computed(() => this.photosUploaded() / this.totalPhotosUploaded());

  protected onFileSelected(event: Event): void {
    event.preventDefault();
    this.resetProgressCounters();
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    const files = Array.from(target.files);
    const deviceId = this.route.snapshot.params['deviceId'];

    this.isLoading.set(true);
    this.totalPhotosUploaded.set(files.length);

    from(files)
      .pipe(
        concatMap((file) => {
          return this.photoService.uploadPhoto(deviceId, file);
        }),
      )
      .subscribe({
        next: () => this.photosUploaded.update((n) => n + 1),
        complete: () => {
          this.photoService.getPhotoThumbnails(deviceId).subscribe({
            next: (val) => {
              this.thumbnailsSync.set(val);
              if (val.length >= 10) {
                this.nextPage.set(2);
                this.isInfiniteScrollDisabled.set(false);
              } else {
                this.isInfiniteScrollDisabled.set(true);
              }
            },
            complete: () => this.isLoading.set(false),
          });
          this.resetProgressCounters();
        },
      });
  }

  protected onIonInfinite(event: Event): void {
    event.preventDefault();
    this.photoService.getPhotoThumbnails(this.route.snapshot.params['deviceId'], this.nextPage()).subscribe({
      next: (val) => {
        this.thumbnailsSync.update((t) => [...t, ...val]);
        if (val.length >= 10) {
          this.nextPage.update((n) => n + 1);
        } else {
          this.isInfiniteScrollDisabled.set(true);
        }
      },
      complete: async () => {
        const target = event.target as HTMLIonInfiniteScrollElement;
        await target.complete();
      },
    });
  }

  private resetProgressCounters(): void {
    this.totalPhotosUploaded.set(1);
    this.photosUploaded.set(0);
  }

  ngOnInit(): void {
    this.thumbnailsSync.set(this.thumbnails() ?? []);
    if ((this.thumbnails() ?? []).length >= 10) {
      this.nextPage.update((n) => n + 1);
    } else {
        this.isInfiniteScrollDisabled.set(true);
      }
    }
}
