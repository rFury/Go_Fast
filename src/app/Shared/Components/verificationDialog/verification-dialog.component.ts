import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodeInputModule } from 'angular-code-input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-verification-dialog',
  templateUrl: './verification-dialog.component.html',
  styleUrls: ['./verification-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CodeInputModule,
    MatButtonModule
  ],
})
export class VerificationDialogComponent {
  code: string = '';
  @Input() isVerifying: boolean = false;
  @Output() canceled = new EventEmitter<boolean>(false);
  @Output() codeVerified = new EventEmitter<string>();
  constructor() {}


  onCodeCompleted(code: string): void {
    this.code = code;
  }
  

  async verify(): Promise<void> {
    if (this.code.length !== 6) return;
    this.codeVerified.emit(this.code);
  }

  cancel(): void {
    this.canceled.emit(true);
  }
  
  resendCode(): void {
  }
}