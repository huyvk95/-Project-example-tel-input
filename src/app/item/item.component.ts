import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import {
  CountryISO,
  NgxIntlTelInputComponent,
  SearchCountryField,
  TooltipLabel,
} from 'ngx-intl-tel-input';

import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit, OnDestroy {
  form: FormGroup | undefined;
  countryCodeControl: AbstractControl | null | undefined = undefined;
  phoneNumberControl: AbstractControl | null | undefined = undefined;
  maxLength = 50;
  position = 0;

  @ViewChild('intlTelInput', { static: true })
  intlTelInput: NgxIntlTelInputComponent | undefined;

  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;

  selectedCountryISO = CountryISO.Switzerland;
  phoneControl = new FormControl();

  destroyed$ = new Subject();

  get countryCode(): FormControl {
    return this.countryCodeControl as FormControl;
  }

  get phoneNumber(): FormControl {
    return this.phoneNumberControl as FormControl;
  }

  constructor() {}

  ngOnInit(): void {
    if (this.countryCode && this.phoneNumber) {
      this.patchValue(this.countryCode.value, this.phoneNumber.value);
      combineLatest([
        this.countryCode.valueChanges,
        this.phoneNumber.valueChanges,
      ])
        .pipe(takeUntil(this.destroyed$))
        .subscribe(([countryCode, phone]) => {
          this.patchValue(countryCode, phone);
        });

      this.phoneControl.valueChanges
        .pipe(takeUntil(this.destroyed$))
        .subscribe((value: any = {}) => {
          // tslint:disable-next-line:variable-name
          const { number, countryCode } = value || {};
          if (!!countryCode) {
            this.selectedCountryISO = countryCode || CountryISO.Switzerland;
            this.countryCode.setValue(countryCode.toLowerCase(), {
              emitEvent: false,
            });
          }
          this.phoneNumber.setValue(number, { emitEvent: false });
        });
    }

    (window as any).intlTelInput = this.intlTelInput;

    document
      .getElementById('phone')
      ?.addEventListener('keydown', (event: any) => {
        this.position = event.target.selectionStart;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  patchValue(countryCode: CountryISO, value: string = ''): void {
    this.phoneControl.patchValue(value, { emitEvent: false });
    this.selectedCountryISO = countryCode || CountryISO.Switzerland;
  }

  onHandlePaste(event: any): void {
    const regex = /^[a-zA-Z0-9 ]*$/;
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData.getData('text');
    if (!regex.test(pastedText)) {
      event.preventDefault();
    }
    if (isNaN(pastedText) === true) {
      event.preventDefault();
    }
  }

  onHandleChange(event: any): void {
    console.log('onHandleChange');
    event.target.value = this.intlTelInput?.value;

    if (this.intlTelInput?.value !== this.intlTelInput?.phoneNumber) {
      const isDelete = event.inputType === 'deleteContentBackward';
      const npos = isDelete ? this.position - 1 : this.position + 1;
      event.target.setSelectionRange(npos, npos);
    }
  }

  onHandleBlur(event: any): void {
    console.log('onHandleBlur');
    event.target.value = this.intlTelInput?.phoneNumber;
  }

  onHandleFocus(event: any): void {
    console.log('onHandleForcus');
    event.target.value = this.intlTelInput?.value;
  }
}
