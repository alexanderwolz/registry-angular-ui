import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthModule } from '../auth/auth.module';
import { RegistryCoreModule } from '../registry-core/registry-core.module';
import { SharedModule } from '../shared/shared.module';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { IndexComponent } from './components/index/index.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MainRoutingModule } from './main-routing.module';

@NgModule({
  declarations: [
    FooterComponent,
    HomeComponent,
    IndexComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    AuthModule,
    RegistryCoreModule,
    SharedModule,
  ]
})
export class MainModule { }
