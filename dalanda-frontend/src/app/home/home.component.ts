import {Component, OnInit} from '@angular/core';
import {TokenService} from '../services/token.service';
import {Router} from '@angular/router';
import { InvoiceService } from '../services/invoice.service';
import {Invoice} from '../models/invoice';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  invoices: Invoice[] = [];
  userUuid!: string;

  constructor(
    private tokenSvc: TokenService,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}
  ngOnInit() {
    // read the real user id that you stored on login
    const uuid = localStorage.getItem('userUuid');
    if (!uuid) {
      this.router.navigate(['/login']);
      return;
    }
    this.userUuid = uuid;

    this.invoiceService.getByUser(uuid)
      .subscribe(list => {
        console.log('Invoices received from backend:', list);
        this.invoices = list;
      });
  }


  private loadInvoices() {
    this.invoiceService.list().subscribe({
      next: invs => this.invoices = invs,
      error: err => console.error('Error loading invoices', err)
    });
  }

  /**
   * If id is passed, go to edit;
   * otherwise open blank form for new
   */
  navigateToInvoiceForm(id?: number) {
    if (id != null) {
      this.router.navigate(['/invoice-form', id]);
    } else {
      this.router.navigate(['/invoice-form']);
    }
  }

  logout() {
    // 1) clear the stored JWT
    this.tokenSvc.clear();

    // 2) navigate back to login
    this.router.navigate(['/login']);
  }

  // navigateToInvoiceForm() {
  //   this.router.navigate(['/invoices/new']);
  // }
}
