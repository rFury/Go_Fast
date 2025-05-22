import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  styles: [
    `

    `,
  ],
  imports: [RouterOutlet],
})
export class ChatComponent {
  constructor() {}
}
