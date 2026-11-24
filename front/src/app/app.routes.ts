import type { Routes } from '@angular/router';

import { frameResolver } from './features/frames/resolvers/frame.resolver';
import { framesResolver } from './features/frames/resolvers/frames.resolver';
import { PlacesListComponent } from './features/places/places-list/places-list.component';
import { placeResolver } from './features/places/resolvers/place.resolver';
import { placesResolver } from './features/places/resolvers/places.resolver';


export const routes: Routes = [
  {
    path: '',
    resolve: { places: placesResolver },
    component: PlacesListComponent,
  },
  {
    path: 'create-place',
    loadComponent: () =>
      import('./features/places/create-place/create-place.component').then((m) => m.CreatePlaceComponent),
  },
  {
    path: 'devices',
    resolve: { frames: framesResolver },
    loadComponent: () =>
      import('./features/frames/frames-list/frames-list.component').then((m) => m.FramesListComponent),
  },
  {
    path: ':id',
    children: [
      {
        path: '',
        resolve: { place: placeResolver },
        loadComponent: () =>
          import('./features/places/place-details/place-details.component').then((m) => m.PlaceDetailsComponent),
      },
      {
        path: 'create-device',
        loadComponent: () =>
          import('./features/frames/pair-frame/pair-frame.component').then((m) => m.PairFrameComponent),
      },
      {
        path: 'device/:deviceId',
        resolve:  { thumbnails: frameResolver },
        loadComponent: () =>
          import('./features/frames/frame-details/frame-details.component').then((m) => m.FrameDetailsComponent),
      },
    ],
  },
];
