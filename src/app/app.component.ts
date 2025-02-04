import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Go_Fast';
  generateArray(size: number): number[] {
    return Array.from({ length: size }, (_, i) => i);
  }

  floor(value: number): number {
    return Math.floor(value);
  }}
