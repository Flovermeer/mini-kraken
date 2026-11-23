import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CreatePlaceComponent } from './create-place.component';

describe('CreatePlaceComponent', () => {
  let component: CreatePlaceComponent;
  let fixture: ComponentFixture<CreatePlaceComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
