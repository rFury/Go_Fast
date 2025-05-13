import { Component, inject, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { Animations } from '../../Animations/public-api';
import { CardComponent } from '../card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { Order } from '../../Models/Order.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackBarService } from '../../Services/snack-bar.service';


@Component({
    selector     : 'ordercarddetails',
    templateUrl  : './order.details.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : Animations,
    standalone   : true,
    imports: [CardComponent,MatIconModule,MatButtonModule]
})
export class OrderDetailsCardComponent
{
    isFullScreen = false;
    @Input()Order: Order | null = null;
    @Input() withMap: boolean = true;
    details: boolean = true;
    private router = inject(Router);
    _route= inject(ActivatedRoute);
    hidden=true;
    copied = false;
    private clipboard = inject(Clipboard);
    private snackBar = inject(SnackBarService);
    orderDetails(id:string){
        this.router.navigate([`${id}`], { relativeTo: this._route }).then();
    }
    copy(code: string) {
        this.clipboard.copy(code);
        this.snackBar.openSnackBar('Copied to clipboard!', 'success');
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 3000);
      }

    }
