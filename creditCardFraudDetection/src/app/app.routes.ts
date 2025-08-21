import { Routes } from '@angular/router';
import { CreditCardComponent } from './card/credit-card/credit-card.component';
export const routes: Routes = [{ path: "credit-card", component: CreditCardComponent },
  { path: "**", redirectTo: "credit-card" }];
