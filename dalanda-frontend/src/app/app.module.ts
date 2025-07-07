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


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InvoiceFormComponent
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
    MatCheckbox
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
