import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
export interface FieldManagerDialogData {
  standardFields: string[];
  customFields: { [key: string]: string };
  disabledFields: string[];
}

@Component({
  selector: 'app-field-manager-dialog',
  standalone: false,
  templateUrl: './field-manager-dialog.component.html',
  styleUrl: './field-manager-dialog.component.css'
})
export class FieldManagerDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FieldManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FieldManagerDialogData,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      disabledFields: this.fb.group(this.createDisabledFieldsControls()),
      customFields: this.fb.array(this.createCustomFieldsControls())
    });
  }

  private createDisabledFieldsControls() {
    const controls: { [key: string]: boolean } = {};
    this.data.standardFields.forEach((field: string) => {
      controls[field] = this.data.disabledFields.includes(field);
    });
    return controls;
  }

  private createCustomFieldsControls() {
    return Object.entries(this.data.customFields).map(([key, value]) => {
      return this.fb.group({
        key: [key],
        value: [value]
      });
    });
  }

  get customFieldsArray(): FormArray {
    return this.form.get('customFields') as FormArray;
  }

  addCustomField(): void {
    this.customFieldsArray.push(this.fb.group({
      key: [''],
      value: ['']
    }));
  }

  removeCustomField(index: number): void {
    this.customFieldsArray.removeAt(index);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const disabledFields = Object.entries(this.form.value.disabledFields)
      .filter(([key, value]) => value)
      .map(([key, value]) => key);

    const customFields: { [key: string]: string } = {};
    this.customFieldsArray.value.forEach((field: { key: string, value: string }) => {
      if (field.key) {
        customFields[field.key] = field.value;
      }
    });

    this.dialogRef.close({
      customFields,
      disabledFields
    });
  }
}
