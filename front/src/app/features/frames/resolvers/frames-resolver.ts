import {inject} from "@angular/core";
import type { ResolveFn } from '@angular/router';
import { type Device, DevicesService } from '@api';


export const framesResolver: ResolveFn<Device[]> = (_route, _state) => {
  const deviceService = inject(DevicesService);
  return deviceService.getDevices();
};
