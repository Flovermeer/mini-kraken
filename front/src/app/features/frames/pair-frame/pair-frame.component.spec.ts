import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PairFrameComponent } from './pair-frame.component';

describe('PairFrameComponent', () => {
  let component: PairFrameComponent;
  let fixture: ComponentFixture<PairFrameComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PairFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
