import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,ViewChild, ElementRef
} from '@angular/core';
import html2pdf from 'html2p
import { Order } from '../../Models/Order.model';

@Component({
  selector: 'compact',
  templateUrl: './compact.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CdkScrollable],
})
export class CompactComponent {
  @Input({ required: true }) Order: Order | null = null;
  @ViewChild('myDiv') myDiv: ElementRef;

  generatePDF() {
    const element = this.myDiv.nativeElement;
    const opt = {
      margin: 1,
      filename: 'myDiv.pdf',
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  }
}
