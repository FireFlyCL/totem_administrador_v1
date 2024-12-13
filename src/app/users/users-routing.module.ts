import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './users-list/users-list.component';
import { EditUserPermissionsComponent } from './edit-user-permissions/edit-user-permissions.component';

const routes: Routes = [
  { path: '', component: UsersListComponent }, // Ruta para el perfil del usuario
  { path: 'permission/:userId', component: EditUserPermissionsComponent } // Ruta para cambiar la contraseña
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
