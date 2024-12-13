import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { LayoutComponent } from './shared/layout/layout.component'; // Importa el LayoutComponent
import { authGuard } from './core/guards/auth.guard'; // Importar el nuevo authGuard
import { guestGuard } from './core/guards/guest.guard'; // Importar el nuevo guestGuard

export const routes: Routes = [
  // Rutas con sidebar (protegidas, requiere estar logueado)
  {
    path: '',
    component: LayoutComponent, // Layout que contiene la sidebar
    canActivate: [authGuard], // Solo accesible si está logueado
    children: [
      { path: 'menu', component: MenuComponent },
      { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule) },
      { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
      { path: 'faqs', loadChildren: () => import('./faqs/faqs.module').then(m => m.FaqsModule) },
      { path: 'collaborator', loadChildren: () => import('./collaborator/collaborator.module').then(m => m.CollaboratorModule) },
      { path: 'information', loadChildren: () => import('./information/information.module').then(m => m.InformationModule) },
      { path: 'maps', loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule) },
      { path: 'stats', loadChildren: () => import('./stats/stats.module').then(m => m.StatsModule) },
      {
        path: 'news',
        loadComponent: () => import('./news/news-common/news-common.component').then(m => m.NewsCommonComponent),
      },
      {
        path: 'news-instagram',
        loadComponent: () => import('./news/news-instagram/news-instagram.component').then(m => m.NewsInstagramComponent),
      },
    ],
  },

  // Rutas sin sidebar (login, 404, etc.)
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  
  // Redirección por defecto al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Ruta para 404
  { path: '**', redirectTo: '/login' },
];
