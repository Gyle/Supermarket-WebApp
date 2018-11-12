import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartPageService } from '../cart-page/cart-page.service';
import { CartItem } from '../cart-page/cart-item';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { APIService } from '../services/api.service';
import { ErrorMessage } from 'ng-bootstrap-form-validation';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent implements OnInit {
  loading = false;
  cartItems: CartItem[];
  total: number = 0;
  numItems: number = 0;
  error: any;
  userAccountInformation: any;

  customErrorMessages: ErrorMessage[] = [
    {
      error: 'digits',
      format: (label, error) => `${label} Only accepts numbers.`
    }, {
      error: 'rangeLength', format: (label, error) => {
        if (error.value[0] === error.value[1]) {
          return `Must be a ${error.value[0]}-digit number.`;
        } else {
          return `Must be a ${error.value[0]}-${error.value[1]} digit number.`;
        }
      }
    }
  ];
  
  form: FormGroup = new FormGroup({
    first_name: new FormControl('', Validators.required),
    last_name: new FormControl('', Validators.required),
    phone : new FormControl('', Validators.required),
    address_line1: new FormControl('', Validators.required),
    address_line2: new FormControl(''),
    address_suburb: new FormControl('', Validators.required),
    address_city: new FormControl('', Validators.required),
    address_postcode: new FormControl('', [Validators.required, CustomValidators.digits, CustomValidators.rangeLength([4, 4])]),
    card_number: new FormControl('', [Validators.required, CustomValidators.creditCard]),
    card_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
    card_cvv: new FormControl('', [Validators.required, CustomValidators.digits, CustomValidators.rangeLength([3, 3])])
  });
  
  constructor(private router: Router, private cartPageService: CartPageService, private apiService: APIService) { }

  ngOnInit() {
    this.loading = true;
    this.getCartItems();
    this.apiService.getUserInformation().subscribe((result) => {
      this.loading = false;
      this.userAccountInformation = Object.assign({card_number: '', card_name: '', card_cvv: ''}, result);
      delete this.userAccountInformation['email'];
      // Need to convert the Address Postcode to string to make Form validation happy.
      this.userAccountInformation.address_postcode = this.userAccountInformation.address_postcode.toString();
      this.form.setValue(this.userAccountInformation);
      this.form.disable();
      this.form.controls['card_number'].enable();
      this.form.controls['card_name'].enable();
      this.form.controls['card_cvv'].enable();
    }, (error) => {
      this.loading = false;
      this.router.navigate(['/']);
    });
  }

  getCartItems(): void {
    this.cartPageService.getCartItems()
      .subscribe(items => {
        this.cartItems = items;
        this.calculateTotalPrice();
        this.numItems = this.cartItems.length;
      })
  }

  calculateTotalPrice() {
    this.total = 0;
    for (var i = 0; i < this.cartItems.length; i++) {
      console.log(this.cartItems[i]);
      this.total += (this.cartItems[i].item_price * this.cartItems[i].quantity);
    }
  }

  backToCart(){
    this.router.navigate(['/cart-page']);
  }

  onSubmit(){

  }
}
