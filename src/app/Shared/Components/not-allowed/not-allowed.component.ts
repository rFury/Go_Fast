import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-not-allowed',
  imports: [MatIcon,RouterLink,MatCardModule],
  templateUrl: './not-allowed.component.html',
  styleUrl: './not-allowed.component.css'
})
export class NotAllowedComponent {

}
