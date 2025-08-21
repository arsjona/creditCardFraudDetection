import { Component, OnInit } from '@angular/core';
import { FraudServiceService, Transaction} from '../fraud-service.service';

@Component({
  selector: 'app-credit-card',
  imports: [],
  templateUrl: './credit-card.component.html',
  styleUrl: './credit-card.component.scss'
})
export class CreditCardComponent implements OnInit {
  cardNumber = '';
  amount: any = '';
  country = '';
  result: any = null;
  history: Transaction[] = [];

  constructor(private fraud: FraudServiceService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  validateCard() {
    const amt = Number(this.amount) || 0;
    this.result = this.fraud.validateTransaction(this.cardNumber.trim(), amt, this.country.trim());
    this.loadHistory();
  }

  clearAll() {
    this.fraud.clearAll();
    this.result = null;
    this.loadHistory();
  }

  private loadHistory() {
    this.history = this.fraud.getTransactions().slice().reverse();
  }
}


