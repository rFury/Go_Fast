import { Component, inject, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatFormFieldControl,
  MatFormFieldModule,
  MatLabel,
  MatPrefix,
} from '@angular/material/form-field';
import { FuseConfirmationService } from '../../../../../../Shared/Components/confirmation/confirmation.service';
import { FilterOptions } from '../../../../../../Shared/Models/FilterOption.model';
import { Pagination } from '../../../../../../Shared/Models/Pagination.model';
import { User } from '../../../../../../Shared/Models/User.model';
import { LoadingService } from '../../../../../../Shared/Services/loading.service';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { CommonModule } from '@angular/common';
import { SideNavService } from '../../../../../../Shared/Services/sideNav.service';
import { HasPermissionDirective } from '../../../../../../Shared/directives/permission/has-permission.directive';
import { MatOption } from '@angular/material/core';
import { Group } from '../../../../../../Shared/Models/Group.model';
import { GroupService } from '../../../../../../Shared/Services/group.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { Client } from '../../../../../../Shared/Models/Client.model';
import { Agent } from '../../../../../../Shared/Models/Agent.model';
import { MapComponent } from '../../../../../../Shared/Components/map/map.component';
import { Subscription } from 'rxjs';
import { LocationService } from '../../../../../../Shared/Services/agent-location.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [
    CommonModule,
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
    HasPermissionDirective,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltip,
    MapComponent,
  ],
})
export class ListComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  _sideNavService = inject(SideNavService);
  _userService = inject(UserService);
  _router = inject(Router);
  _fuseConfirmationService = inject(FuseConfirmationService);
  _route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
  _locationService = inject(LocationService);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filterOptions: FilterOptions = new FilterOptions();
  currentSize = 10;
  currentPage = 1;
  displayedList: Pagination<Agent>;
  typingTimer;
  doneTypingInterval = 500;
  isScreenSmall: boolean;
  private locationSub!: Subscription;
  locations: any[] = [];

  visiblePasswords = new Set<string>(); // ou number selon l'ID

  //************* FILTERS *****************//
  openFilter = false;
  listStatusUsers = [
    { value: 'online', label: 'Online', color: 'bg-green-500' },
    { value: 'away', label: 'Away', color: 'bg-yellow-500' },
    { value: 'busy', label: 'Busy', color: 'bg-red-500' },
    { value: 'not-visible', label: 'Not Visible', color: 'bg-gray-500' },
  ];
  filterStatus: string[] = [];
  filterSearch: string;
  filterNewOld: string;
  filtersGroups: string[] = [];

  ngOnInit(): void {
    this.getList();
  }
  updateMap(location: any) {
    // Update your map here with the new location
    console.log('New location:', location);
    return location.coordinates;
    // You can use Leaflet, Google Maps, or any other mapping library
  }
  pageChanged(event: PageEvent): void {
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
    this._userService
      .getUsers(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch,
        this.filtersGroups.toString(),
        this.filterStatus.toString(),
        this.filterNewOld,
        'agent'
      )
      .subscribe({
        next: (results) => {
          console.log(results);
          this.displayedList = results;
          this.openFilter = false;
          this._loadingService.hide();
        },
        error: () => {
          this._loadingService.hide();
          this.openFilter = false;
        },
      });
  }
  addOne(): void {
    this._router.navigate(['add'], { relativeTo: this._route }).then();
  }
  openShow(row: Agent) {
    this._router.navigate([`${row._id}`], { relativeTo: this._route }).then();
  }
  openEdit(row: Agent) {
    this._router
      .navigate([`${row._id}/edit`], { relativeTo: this._route })
      .then();
  }
  updateSearch() {
    clearTimeout(this.typingTimer);
    this.filterOptions.search = this.filterSearch;
    this.typingTimer = setTimeout(() => {
      this.paginator?.firstPage();
      this.getList();
    }, this.doneTypingInterval);
  }
  deleteOne(row: Agent) {
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
        this._userService.deleteOne(row._id!, 'agent').subscribe(() => {
          this.getList();
        });
      }
    });
  }
  assignRoutes(){
    
  }
  togglePassword(id: string) {
    if (this.visiblePasswords.has(id)) {
      this.visiblePasswords.delete(id);
    } else {
      this.visiblePasswords.add(id);
    }
  }
}
