import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqsCategoriesComponent } from './faqs-categories/faqs-categories.component';
import { FaqsIndexComponent } from './faqs-index/faqs-index.component';

const routes: Routes = [
  { path: '', component: FaqsCategoriesComponent },
  { path: 'categories/:categoryId', component: FaqsIndexComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FaqsRoutingModule { }
