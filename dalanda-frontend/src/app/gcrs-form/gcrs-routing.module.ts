import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GcrsFormComponent} from './gcrs-form.component';

const routes: Routes = [
  {
    path: '',
    component: GcrsFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GcrsRoutingModule { }
