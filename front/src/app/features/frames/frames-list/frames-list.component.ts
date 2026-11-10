import { JsonPipe } from '@angular/common';
import { input, Component } from '@angular/core';
import type { Device } from '@api';

@Component({
  selector: 'app-frames-list',
  templateUrl: './frames-list.component.html',
  styleUrls: ['./frames-list.component.scss'],
  imports: [JsonPipe],
})
export class FramesListComponent {
  protected readonly frames = input<Device[]>();
}
