import type { Routes } from '@angular/router';

import { framesResolver } from './features/frames/resolvers/frames-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'devices',
        resolve: { frames: framesResolver },
        loadComponent: () =>
          import('./features/frames/frames-list/frames-list.component').then((m) => m.FramesListComponent),
      },
    ],
  },
];
