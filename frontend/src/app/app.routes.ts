import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { UsuariosPageComponent } from './features/usuarios/page/usuarios-page.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';

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
    path: 'usuarios', 
    component: UsuariosPageComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard', 
    redirectTo: '/usuarios',
    pathMatch: 'full'
  },
  { path: '', redirectTo: '/usuarios', pathMatch: 'full' },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];
