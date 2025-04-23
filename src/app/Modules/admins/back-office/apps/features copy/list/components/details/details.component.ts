import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import {
  MatError,
  MatSelect,
  MatSelectTrigger,
} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

import { forkJoin } from 'rxjs';
import { FuseConfirmationService } from '../../../../../../../../Shared/Components/confirmation/confirmation.service';
import { Feature } from '../../../../../../../../Shared/Models/Feature.model';
import { FeatureService } from '../../../../../../../../Shared/Services/feature.service';
import { LoadingService } from '../../../../../../../../Shared/Services/loading.service';
import { icon } from '../../../../../../../../Shared/enums/iconType';
import { material } from '../../../../../../icons/data';
import { method } from 'lodash';
import { listFeatureStatus } from '../../../../../../../../Shared/enums/featureStatus';
import {
  FeatureType,
  listFeatureType,
} from '../../../../../../../../Shared/enums/featureType';
import { HasPermissionDirective } from '../../../../../../../../Shared/directives/permission/has-permission.directive';
import { Order } from '../../../../../../../../Shared/Models/Order.model';
import { OrderService } from '../../../../../../../../Shared/Services/order.service';
import { Client } from '../../../../../../../../Shared/Models/Client.model';
import { DeliveryType } from '../../../../../../../../Shared/enums/delivery.enums';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MapComponent } from '../../../../../../../../Shared/Components/map/map.component';
import { NgClass } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    ReactiveFormsModule,
    MatError,
    HasPermissionDirective,
    MatButtonToggleModule,
    MatCardModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    NgClass,
    MapComponent,
  ],
})
export class DetailsComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  _orderService = inject(OrderService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _fuseConfirmationService = inject(FuseConfirmationService);
  _loadingService = inject(LoadingService);
  //********* DECLARE CLASSES/ENUMS ***********//
  id = this._route.snapshot.paramMap.get('id') || undefined;
  Order = new Order();
  client: Client = new Client();
  DeliveryType = DeliveryType;
  searchQueryA: string = '';
  searchQueryB: string = '';
  ClientLabel: string = '';

  ngOnInit(): void {
    if (this.id) {
      this._loadingService.show();
      forkJoin([this._orderService.getOrder(this.id)]).subscribe({
        next: (result: [Order]) => {
          this.Order = result[0];
          this.client = this.Order.client as Client;
          console.log(this.client);
          this.ClientLabel = this.client?.first_name+" "+this.client?.last_name+" ("+this.client?.email+")";
          this.searchQueryA = this.Order.pick_up?.place?.gouvernorat+", "+this.Order.pick_up?.place?.name;
          this.searchQueryB = this.Order.destination?.place?.gouvernorat+", "+this.Order.destination?.place?.name;

          console.log(this.Order);
          this._loadingService.hide();
        },
        error: () => {
          this._loadingService.hide();
        },
      });
    }
  }

  updateOrder() {
    this._router
      .navigate([`/admin/dashboard/orders/${this.Order._id}/edit`])
      .then();
  }
  deleteOrder() {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete',
      message: 'Would you like to confirm the deletion ?',
      actions: {
        confirm: {
          label: 'yes',
        },
        cancel: {
          label: 'no',
        },
      },
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === 'confirmed') {
        this._orderService.deleteOrder(this.Order._id!).subscribe(() => {});
        this._router.navigate(['/admin/dashboard/orders']).then();
      }
    });
  }
}
