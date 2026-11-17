import { inject } from '@angular/core';
import type { ResolveFn} from '@angular/router';
import { RedirectCommand, Router } from '@angular/router';
import type { Place} from '@api';
import { PlacesService } from '@api';
import { map } from 'rxjs';

export const placesResolver: ResolveFn<Place[]> = (_route, _state) =>  {
  const router = inject(Router);
  const placesService = inject(PlacesService);
  const places = placesService.getPlaces();
  return places.pipe(
    map(places => {
      if (!places.length) return new RedirectCommand(router.parseUrl('/create-place'));
      return places;
    })
  );
}
