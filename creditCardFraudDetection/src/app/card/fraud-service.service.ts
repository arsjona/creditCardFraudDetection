import { Injectable } from '@angular/core';
export interface Transaction {
  cardNumber: string;
  amount: number;
  country: string;
  timestamp: string; 
}

@Injectable({
  providedIn: 'root'
})
export class FraudServiceService {
private CARDS_KEY = 'cards';
  private TX_KEY = 'transactions';

  constructor() {
    this.seedIfEmpty();
  }

 
  validateTransaction(cardNumber: string, amount: number, country: string) {
    const now = new Date();
    const transactions = this.getTransactionsInternal();

    const fraud_reasons: string[] = [];

    // Rule 1: High amount
    if (amount > 5000) fraud_reasons.push('High-value transaction');

    // Rule 2: Too many transactions in 1 minute
    const recent = transactions.filter(
      t =>
        t.cardNumber === cardNumber &&
        now.getTime() - new Date(t.timestamp).getTime() < 60_000
    );
    if (recent.length >= 3) fraud_reasons.push('Too many transactions in 1 minute');

    // Rule 3: Impossible travel (< 1 hour, different countries)
    const lastTx = [...transactions].reverse().find(t => t.cardNumber === cardNumber);
    if (
      lastTx &&
      lastTx.country !== country &&
      now.getTime() - new Date(lastTx.timestamp).getTime() < 3_600_000
    ) {
      fraud_reasons.push('Impossible travel: different countries in <1h');
    }

    // Save current tx
    const newTx: Transaction = {
      cardNumber,
      amount,
      country,
      timestamp: now.toISOString(),
    };
    transactions.push(newTx);
    localStorage.setItem(this.TX_KEY, JSON.stringify(transactions));

    return {
      valid: this.luhnCheck(cardNumber),
      type: this.getCardType(cardNumber),
      fraud: fraud_reasons.length > 0,
      fraud_reasons,
    };
  }

  getTransactions(): Transaction[] {
    return this.getTransactionsInternal();
  }

  clearAll() {
    localStorage.removeItem(this.TX_KEY);
    this.seedIfEmpty(); // keep cards; reset transactions
  }

  
  private seedIfEmpty() {
    if (!localStorage.getItem(this.CARDS_KEY)) {
      const mockCards = [
        { number: '4539578763621486', type: 'Visa' },
        { number: '4111111111111111', type: 'Visa' },
        { number: '5500005555555559', type: 'MasterCard' },
        { number: '371449635398431',  type: 'American Express' },
        { number: '6011111111111117', type: 'Discover' }
      ];
      localStorage.setItem(this.CARDS_KEY, JSON.stringify(mockCards));
    }
    if (!localStorage.getItem(this.TX_KEY)) {
      localStorage.setItem(this.TX_KEY, JSON.stringify([]));
    }
  }

  private getTransactionsInternal(): Transaction[] {
    try {
      return JSON.parse(localStorage.getItem(this.TX_KEY) || '[]');
    } catch {
      return [];
    }
  }

  // Luhn algorithm for card number validation
  private luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let doubleDigit = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      const c = cardNumber.charAt(i);
      if (c < '0' || c > '9') continue;
      let n = c.charCodeAt(0) - 48;
      if (doubleDigit) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      doubleDigit = !doubleDigit;
    }
    return sum % 10 === 0;
  }
  private getCardType(cardNumber: string): string {
    const cards = JSON.parse(localStorage.getItem(this.CARDS_KEY) || '[]');
    const found = cards.find((c: any) => c.number === cardNumber);
    if (found?.type) return found.type;
    if (/^4\d{12}(\d{3})?$/.test(cardNumber)) return 'Visa';
    if (/^5[1-5]\d{14}$/.test(cardNumber)) return 'MasterCard';
    if (/^3[47]\d{13}$/.test(cardNumber)) return 'American Express';
    if (/^6(?:011|5\d{2})\d{12}$/.test(cardNumber)) return 'Discover';
    return 'Unknown';
  }
 
}
