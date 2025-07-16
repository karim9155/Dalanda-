import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GcrsFormComponent } from './gcrs-form.component';

describe('GcrsFormComponent', () => {
  let component: GcrsFormComponent;
  let fixture: ComponentFixture<GcrsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GcrsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GcrsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
