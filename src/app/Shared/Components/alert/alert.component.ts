import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule} from '@angular/common';
@Component({
  selector: 'app-alert',
  imports: [
    MatIcon,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {

  @Input() Data!: data;

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }



}
interface data{
  alert_class : string,
  message :string,
  link?:string
  linkMessage?:string;
}