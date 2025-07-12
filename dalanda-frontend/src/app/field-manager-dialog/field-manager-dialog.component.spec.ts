import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldManagerDialogComponent } from './field-manager-dialog.component';

describe('FieldManagerDialogComponent', () => {
  let component: FieldManagerDialogComponent;
  let fixture: ComponentFixture<FieldManagerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FieldManagerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldManagerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
