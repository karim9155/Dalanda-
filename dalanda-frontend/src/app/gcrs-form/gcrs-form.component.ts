import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GcrsService } from '../services/gcrs.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-gcrs-form',
  templateUrl: './gcrs-form.component.html',
  standalone: false,
  styleUrls: ['./gcrs-form.component.css']
})
export class GcrsFormComponent implements OnInit {
  form: FormGroup;
  clientType: 'Entreprise' | 'Personne physique' = 'Entreprise';

  constructor(
    private fb: FormBuilder,
    private gcrsService: GcrsService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      dateFacturation: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      amountTTC: ['', Validators.required],
      tauxRetenue: ['', Validators.required],
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      companyId: ['', Validators.required],
      clientType: ['Entreprise', Validators.required],
      clientName: ['', Validators.required],
      clientAddress: ['', Validators.required],
      clientId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const clientTypeControl = this.form.get('clientType');
    if (clientTypeControl) {
      clientTypeControl.valueChanges.subscribe(value => {
        this.clientType = value;
      });
    }
  }

  preview(): void {
    this.gcrsService.preview(this.form.value);
  }

  download(): void {
    this.gcrsService.download(this.form.value);
  }
  cancel(): void {

    this.router.navigate(['/home']);
  }
}
