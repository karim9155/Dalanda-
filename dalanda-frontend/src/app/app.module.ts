import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AuthInterceptor} from './services/authinterceptor.service';
import {MaterialModule} from './material-module/material-module.module';
import {AuthModule} from './auth/auth.module';
import { HomeComponent } from './home/home.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle, MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon }           from '@angular/material/icon';
import {RegisterComponent} from './auth/register/register.component';
import {LoginComponent} from './auth/login/login.component';
import { PdfPreviewDialogComponent } from './pdf-preview-dialog/pdf-preview-dialog.component';
import {MatDialogActions, MatDialogContent} from '@angular/material/dialog';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InvoiceFormComponent,
    LoginComponent,
    RegisterComponent,
    PdfPreviewDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    AuthModule,
    ReactiveFormsModule,
    FormsModule,
    MatSlideToggle,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatDatepicker,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckbox,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    MatIcon,
    MatProgressSpinner,
    MatDialogContent,
    MatDialogActions,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
