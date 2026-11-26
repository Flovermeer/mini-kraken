import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoGalleryModalComponent } from './photo-gallery-modal.component';

describe('PhotoGalleryModalComponent', () => {
  let component: PhotoGalleryModalComponent;
  let fixture: ComponentFixture<PhotoGalleryModalComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoGalleryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
