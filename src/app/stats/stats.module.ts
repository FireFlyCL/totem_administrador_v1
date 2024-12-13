import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatsRoutingModule } from './stats-routing.module';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

// Importa los componentes específicos de este módulo
import { StatsGlobalComponent } from './stats-global/stats-global.component';
import { StatsAdminComponent } from './stats-admin/stats-admin.component';
import { StatsCollaboratorComponent } from './stats-collaborator/stats-collaborator.component';
import { StatsFaqsComponent } from './stats-faqs/stats-faqs.component';
import { StatsInformationComponent } from './stats-information/stats-information.component';
import { StatsMapsComponent } from './stats-maps/stats-maps.component';
import { StatsNewsComponent } from './stats-news/stats-news.component';


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    StatsRoutingModule,
    FormsModule,
    NgxPaginationModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
  ]
})
export class StatsModule { }
