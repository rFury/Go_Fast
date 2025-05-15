import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../../Models/Order.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'compact',
  templateUrl: './compact.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CdkScrollable, MatButtonModule],
})
export class CompactComponent {
  @Input({ required: true }) Order: Order | null = null;
  @ViewChild('myDiv') myDiv: ElementRef;
  @Output() pdfGenerated = new EventEmitter<void>(); // Emit event when PDF is generated

  async generatePDF() {
    const element = this.myDiv.nativeElement;
    const canvas = await html2canvas(element!);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${this.Order?.code || 'order'}.pdf`, { returnPromise: true }).then(()=>{
      this.pdfGenerated.emit(); // Notify parent component
    });
  }
}
