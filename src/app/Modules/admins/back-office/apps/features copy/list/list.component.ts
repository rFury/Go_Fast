import {Component, inject, OnInit, ViewChild} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import { GoogleMapsModule } from '@angular/google-maps';

import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInput, MatLabel} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix } from '@angular/material/form-field';

import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import { FuseConfirmationService } from '../../../../../../Shared/Components/confirmation/confirmation.service';
import { listFeatureStatus } from '../../../../../../Shared/enums/featureStatus';
import { listFeatureType } from '../../../../../../Shared/enums/featureType';
import { Feature } from '../../../../../../Shared/Models/Feature.model';
import { Pagination } from '../../../../../../Shared/Models/Pagination.model';
import { FeatureService } from '../../../../../../Shared/Services/feature.service';
import { LoadingService } from '../../../../../../Shared/Services/loading.service';
import { FilterOptions } from '../../../../../../Shared/Models/FilterOption.model';
import { SideNavService } from '../../../../../../Shared/Services/sideNav.service';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { HasPermissionDirective } from '../../../../../../Shared/directives/permission/has-permission.directive';
import { OrderService } from '../../../../../../Shared/Services/order.service';
import { Order } from '../../../../../../Shared/Models/Order.model';
import { Client } from '../../../../../../Shared/Models/Client.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
    imports: [
        MatFormField,
        MatIcon,
        MatPrefix,
        MatInput,
        FormsModule,
        MatButton,
        MatIconButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatPaginator,
        MatLabel,
        MatOption,
        MatSelect,
        HasPermissionDirective,
        GoogleMapsModule,
    ],
})
export class ListComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  _orderService= inject(OrderService);
  _router= inject(Router);
  _fuseConfirmationService= inject(FuseConfirmationService);
  _route= inject(ActivatedRoute);
  _loadingService = inject(LoadingService)
  _sideNavService = inject(SideNavService);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filterOptions: FilterOptions = new FilterOptions();
  order: Order;
  currentSize = 10;
  currentPage = 1;
  displayedList: Pagination<Order>;
  typingTimer;
  doneTypingInterval = 500;
  isScreenSmall: boolean;
  //************* FILTERS *****************//
  openFilter = false;
  protected readonly listFeatureType = listFeatureType;
  filterType: string[] = [];
  filterStatus: string[] = [];
  filterSearch: string;

  ngOnInit(): void {
    this.getList();
    console.log(this._sideNavService.getOpen());
  }
  pageChanged(event: PageEvent ): void {
    let { pageIndex } = event;
    const { pageSize } = event;
    pageIndex++;
    if (pageSize !== this.currentSize) {
      pageIndex = 1;
      this.paginator.firstPage();
    }
    this.currentSize = pageSize;
    this.currentPage = pageIndex;
    this.getList();
  }
  getList(): void {
    this._loadingService.show();
    this._orderService
      .getOrders(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch,
        this.filterStatus.toString(),
      )
      .subscribe({
          next: results => {
              this.displayedList = results;
              console.log(this.displayedList
                
              );
              
              this.openFilter = false;
              this._loadingService.hide();
          },
          error: () => {
              this._loadingService.hide();
              this.openFilter = false;
          }
      });
  }
  addFeature(): void {
    this._router.navigate(['add'], { relativeTo: this._route }).then();
  }
  openShow(row: Feature) {
    this._router.navigate([`${row._id}`], { relativeTo: this._route }).then();
  }
  openEdit(feature: Feature) {
    this._router.navigate([`${feature._id}/edit`], { relativeTo: this._route }).then();
  }
  updateSearch() {
    clearTimeout(this.typingTimer);
    this.filterOptions.search = this.filterSearch;
    this.typingTimer = setTimeout(() => {
      this.paginator?.firstPage();
      this.getList();
    }, this.doneTypingInterval);
  }
  deleteFeature(feature: Feature) {
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
        /*this._featureService.deleteFeature(feature._id!).subscribe(() => {
          this.getList();
        });*/
      }
    });
  }
  clientName(order:Order):string{
    let client = order.client as Client
    return client.first_name + " " + client.last_name
  }
  refresh(): void {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.getList();
    }, this.doneTypingInterval);
  }

    protected readonly listFeatureStatus = listFeatureStatus;
}
