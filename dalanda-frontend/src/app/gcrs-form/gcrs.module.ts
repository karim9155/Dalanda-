import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GcrsRoutingModule } from './gcrs-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material-module/material-module.module';
import {GcrsFormComponent} from './gcrs-form.component';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';

@NgModule({
  declarations: [GcrsFormComponent],
  imports: [
    CommonModule,
    GcrsRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    MatRadioButton,
    MatRadioGroup,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput
  ]
})
export class GcrsModule { }
