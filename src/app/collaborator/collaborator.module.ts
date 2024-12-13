import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CollaboratorRoutingModule } from './collaborator-routing.module';
import { CollaboratorCategoriesComponent } from './collaborator-categories/collaborator-categories.component';
import { CollaboratorService } from './services/collaborator.service';
import { CollaboratorIndexComponent } from './collaborator-index/collaborator-index.component';
import { CollaboratorImageComponent } from './collaborator-image/collaborator-image.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    CollaboratorRoutingModule,
    CollaboratorCategoriesComponent, // Importa el componente
    CollaboratorIndexComponent, // Importa otros componentes según se necesiten
    CollaboratorImageComponent,
    RouterModule
  ],
  providers: [CollaboratorService],
  bootstrap: [CollaboratorModule]
})
export class CollaboratorModule { }
