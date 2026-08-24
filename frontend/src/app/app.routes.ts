import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { NotFoundComponent } from './Components/not-found/not-found.component';
import { authGuard } from './Guard/auth-guard';
import { NoAuthGuard } from './Guard/no-auth-guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];
