import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import type { Thumbnail } from '@api';
import { PhotosService } from '@api';

export const frameResolver: ResolveFn<Thumbnail[]> = (route, _state) => {
  const photosService = inject(PhotosService);
  const deviceId = route.params['deviceId'];
  return photosService.getPhotoThumbnails(deviceId);
};
