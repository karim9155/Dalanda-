import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {AuthService} from './services/auth.service';
import {AuthGuardService} from './services/auth-guard.service';
import {HomeComponent} from './home/home.component';
import {InvoiceFormComponent} from './invoice-form/invoice-form.component';

const routes: Routes = [
  // Public
  { path: 'login',    component: LoginComponent  },
  { path: 'register', component: RegisterComponent },

  // // Protected feature modules
  { path: 'home', component: HomeComponent, canActivate: [AuthGuardService] },
  { path: 'invoices/new', component: InvoiceFormComponent, canActivate: [AuthGuardService] },
  { path: 'invoice-form', component: InvoiceFormComponent, canActivate: [AuthGuardService] },
  { path: 'invoice-form/:id', component: InvoiceFormComponent, canActivate: [AuthGuardService] },
  { path: 'gcrs', loadChildren: () => import('./gcrs-form/gcrs.module').then(m => m.GcrsModule), canActivate: [AuthGuardService] },
  // Default & fallback
  { path: '',     redirectTo: 'login', pathMatch: 'full' },
  { path: '**',   redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
