import { CommonModule, NgFor } from '@angular/common';
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
    NgFor,
  ],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent implements OnInit , OnDestroy {
  codeForm!: FormGroup;
  codeInputs = new Array(6); 
  timeLeft = 600; // 10 minutes
  timer: any;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.codeForm = this.fb.group({});
    
    // Créer un FormControl pour chaque case
    for (let i = 0; i < 8; i++) {
      this.codeForm.addControl('code' + i, new FormControl('', [Validators.required, Validators.pattern('[0-9]')]));
    }

    // Lancer le compte à rebours
    this.startTimer();
  }

  // Déplacement automatique du curseur
  moveToNext(index: number, event: any) {
    const value = event.target.value;
    if (value.length === 1 && index < 7) {
      const nextInput = document.querySelectorAll('input')[index + 1] as HTMLInputElement;
      nextInput.focus();
    }
  }

  // Retour au champ précédent si backspace est pressé
  moveToPrev(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && index > 0) {
      const prevInput = document.querySelectorAll('input')[index - 1] as HTMLInputElement;
      prevInput.focus();
    }
  }

  // Vérifier si toutes les cases sont remplies
  isCodeComplete(): boolean {
    return Object.values(this.codeForm.value).every(val => val !== '');
  }

  // Lancer le compte à rebours
  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--; // Décrémenter chaque seconde
      } else {
        clearInterval(this.timer);
        this.router.navigate(['/home']); // Redirection après expiration
      }
    }, 1000);
  }

  // Nettoyage du timer lorsque le composant est détruit
  ngOnDestroy() {
    clearInterval(this.timer);
  }

  verifyCode() {
    if (this.isCodeComplete()) {
      const code = Object.values(this.codeForm.value).join('');
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
}