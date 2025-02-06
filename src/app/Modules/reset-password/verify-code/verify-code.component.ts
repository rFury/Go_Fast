import { CommonModule} from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-code',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
  ],
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.css']
})
export class VerifyCodeComponent implements OnInit, OnDestroy {
  codeForm!: FormGroup;
  codeInputs = new Array(6); 
  timeLeft = 600; // 10 minutes
  timer: any;
  email!: string | null;
  activebtn: boolean = false;
  resendDisabled: boolean = false;
  resendTimer: number = 10; 
  resendInterval: any;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.email = sessionStorage.getItem('email');
    if (!this.email) {
      this.router.navigate(['/home']);
    }

    this.codeForm = this.fb.group({});
    
    for (let i = 0; i < 8; i++) {
      this.codeForm.addControl('code' + i, new FormControl('', [Validators.required, Validators.pattern('[0-9]')]));
    }

    this.codeForm.valueChanges.subscribe(() => {
      this.activebtn = this.isCodeComplete();
      console.log(Object.values(this.codeForm.value).join(''))
      console.log(this.activebtn)
    });

    this.startTimer();
  }

  moveToNext(index: number, event: any) {
    const value = event.target.value;
    if (value.length === 1 && index < 5) {
      const nextInput = document.querySelectorAll('input')[index + 1] as HTMLInputElement;
      nextInput.focus();
    }
  }

  moveToPrev(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && index > 0) {
      // Effacer uniquement la valeur du champ actuel dans le formulaire
      this.codeForm.get('code' + index)?.setValue('');
  
      // Déplacer le focus vers le champ précédent
      const prevInput = document.querySelectorAll('input')[index - 1] as HTMLInputElement;
      prevInput.focus();
    }
  }
  

  isCodeComplete(): boolean {
    return Object.values(this.codeForm.value).join('').length===6;
    /* Object.values(this.codeForm.value).every(val => val && val.toString().length === 1) */
  }
  

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--; 
      } else {
        clearInterval(this.timer);
        this.router.navigate(['/home']);
      }
    }, 1000);
  }

  startResendTimer() {
    this.resendDisabled = true;
    this.resendTimer = 10;
    
    this.resendInterval = setInterval(() => {
      if (this.resendTimer > 0) {
        this.resendTimer--;
      } else {
        clearInterval(this.resendInterval);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    clearInterval(this.resendInterval);
  }

  verifyCode() {
    if (this.isCodeComplete()) {
      const code = Object.values(this.codeForm.value).join('');
      this.router.navigate(['/change-password']);
      console.log("Entered Code:", code);
      // Logique de vérification ici...
    }
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  resendCode() {
    console.log("Resending code...");
    this.startResendTimer();
  }
}
