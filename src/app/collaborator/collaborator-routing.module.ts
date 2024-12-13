import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollaboratorCategoriesComponent } from './collaborator-categories/collaborator-categories.component';
import { CollaboratorIndexComponent } from './collaborator-index/collaborator-index.component';
import { CollaboratorImageComponent } from './collaborator-image/collaborator-image.component';

const routes: Routes = [
  { path: '', component: CollaboratorCategoriesComponent }, // Ruta principal para `CollaboratorCategoriesComponent`
  { path: 'index/:categoryId', component: CollaboratorIndexComponent }, // Ruta con parámetro para `CollaboratorIndexComponent`
  { path: 'image/:categoryId', component: CollaboratorImageComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollaboratorRoutingModule { }
