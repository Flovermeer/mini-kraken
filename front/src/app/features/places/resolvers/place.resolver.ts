import { inject } from '@angular/core';
import type { ResolveFn} from '@angular/router';
import  { RedirectCommand, Router} from '@angular/router';
import type { Place} from '@api';
import { PlacesService } from '@api';
import { map } from 'rxjs';

export const placeResolver: ResolveFn<Place> = (route, _state) => {
  const router = inject(Router);
  const placesService = inject(PlacesService);
  const place = placesService.getPlace(route.params['id']);
  return place.pipe(
    map(place => {
      if (!place) return new RedirectCommand(router.parseUrl(''));
      return place;
    })
  );
};
