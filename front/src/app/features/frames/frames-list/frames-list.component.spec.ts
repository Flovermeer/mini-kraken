import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FramesListComponent } from './frames-list.component';

describe('FramesListComponent', () => {
  let component: FramesListComponent;
  let fixture: ComponentFixture<FramesListComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FramesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
