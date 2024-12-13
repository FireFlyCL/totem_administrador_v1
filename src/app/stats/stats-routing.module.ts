import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StatsGlobalComponent } from './stats-global/stats-global.component'
import { StatsAdminComponent } from './stats-admin/stats-admin.component'
import { StatsCollaboratorComponent } from './stats-collaborator/stats-collaborator.component'
import { StatsFaqsComponent } from './stats-faqs/stats-faqs.component'
import { StatsInformationComponent } from './stats-information/stats-information.component'
import { StatsMapsComponent } from './stats-maps/stats-maps.component'
import { StatsNewsComponent } from './stats-news/stats-news.component'

const routes: Routes = [
 { path: '', component: StatsGlobalComponent }, 
 { path: 'admin', component: StatsAdminComponent },
 { path: 'collaborator', component: StatsCollaboratorComponent},
 { path: 'faqs', component: StatsFaqsComponent},
 { path: 'information', component: StatsInformationComponent},
 { path: 'maps', component: StatsMapsComponent},
 { path: 'news', component: StatsNewsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatsRoutingModule { }
