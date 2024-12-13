import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersRoutingModule } from './users-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UsersRoutingModule,
    RouterModule.forChild([])
  ]
})
export class UsersModule { }
