import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsCommonComponent } from './news-common/news-common.component'
import { NewsInstagramComponent } from './news-instagram/news-instagram.component'

const routes: Routes = [
 { path: '', component: NewsCommonComponent }, 
 { path: 'instagram', component: NewsInstagramComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
