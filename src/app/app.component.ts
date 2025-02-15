import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './Shared/Components/loader/loader.component';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    LoaderComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Go_Fast';
}
