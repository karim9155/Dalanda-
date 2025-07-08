// src/app/auth/auth.module.ts
import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { ReactiveFormsModule }  from '@angular/forms';

// Material modules (no .d-XYZ paths!)
import { MatCardModule }        from '@angular/material/card';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatButtonModule }      from '@angular/material/button';
import { MatSelectModule }      from '@angular/material/select';

import { AuthRoutingModule }    from './auth-routing.module';
import { LoginComponent }       from './login/login.component';
import { RegisterComponent }    from './register/register.component';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,   // <-- for [formGroup]
    MatCardModule,         // <-- <mat-card>
    MatFormFieldModule,    // <-- <mat-form-field>
    MatInputModule,        // <-- <input matInput>
    MatButtonModule,       // <-- <button mat-raised-button>
    MatSelectModule,       // <-- <mat-select> & <mat-option>
    AuthRoutingModule,

  ]
})
export class AuthModule {}
