// src/app/auth/register/register.component.ts
import { Component, OnInit }                from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';

// Material
import { MatCardModule }       from '@angular/material/card';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatButtonModule }     from '@angular/material/button';

import { AuthService }        from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material modules needed for form fields and select
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      roles:    [['USER'], Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    const { username, password, roles } = this.form.value;
    this.auth.register(username, password, roles).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // show an error
      }
    });
  }
}
