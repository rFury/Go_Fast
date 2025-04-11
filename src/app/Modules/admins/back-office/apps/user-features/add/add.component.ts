import { Component, inject, OnInit } from '@angular/core';
import { FormControl, NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { MatOption } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelect, MatSelectChange, MatSelectTrigger } from '@angular/material/select';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Observable, startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { Animations } from '../../../../../../Shared/Animations/public-api';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';
import { environment } from '../../../../../../../environments/environment';
import { FuseConfirmationService } from '../../../../../../Shared/Components/confirmation/confirmation.service';
import { User } from '../../../../../../Shared/Models/User.model';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { Feature } from '../../../../../../Shared/Models/Feature.model';
import { UserFeature } from '../../../../../../Shared/Models/UserFeature.model';
import { FeatureService } from '../../../../../../Shared/Services/feature.service';
import { SnackBarService } from '../../../../../../Shared/Services/snack-bar.service';
import { UserFeaturesService } from '../../../../../../Shared/Services/userFeature.service';
import { HasPermissionDirective } from '../../../../../../Shared/directives/permission/has-permission.directive';
import { GroupFeature } from '../../../../../../Shared/Models/GroupFeature.model';

@Component({
  selector: 'app-details',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  animations: Animations,
  standalone: true,
  imports: [
    FormsModule,
    MatProgressBar,
    MatButton,
    MatFormField,
    MatSelect,
    MatSelectTrigger,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatOption,
    MatError,
    MatTooltip,
    MatSlideToggle,
    MatRadioButton,
    MatIconButton,
    MatIcon,
    AsyncPipe,
    HasPermissionDirective
  ],
})
export class AddComponent implements OnInit {
  url = `${environment}/assets/`;
  loading = false;
  isLoading: any;
  filteredListGroups: any;
  featureId: Feature[] = [];
  filteredList :Feature[][] = [];
  listFeature: Feature[]=[];
  type: boolean[] = [true, true, true, true, true, true];
  groupFeature: UserFeature[] = [new UserFeature()];
  finalList:UserFeature[]=[];
  listUsers: User[];
  filteredListUsers: Observable<User[]>;
  user: User | null = new User();
  userFilterControl: FormControl<any> = new FormControl();
  private userFeaturesService=inject(UserFeaturesService)

  constructor(
    private featureService: FeatureService,
    private userService: UserService,
    private _router: Router,
    private snackBarService: SnackBarService,
    private _fuseConfirmationService: FuseConfirmationService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.set('home/userfeatures/add', 'Add');

    this.userService.getAll().subscribe(
      (res)=>{
        this.listUsers = res;
        this.filteredListUsers = this.userFilterControl.valueChanges.pipe(
          startWith(''),
          map((value) => this._filterUser(value)),
        );
      }
    )
    this.groupFeature[0] = {
      list: true,
      create: true,
      read: true,
      update: true,
      delete: true,
      status: true,
      defaultFeature: false,
    };
  }

  onUserSelected(event: MatSelectChange) {
    if(this.user!=null){
      this.featureService.getNotAllFeature(this.user._id!).subscribe(
        (feature) => {
          this.listFeature = feature;
          this.filteredList.push(feature);
        },
        () => {},
      )
    }
  }
  _filterUser(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.listUsers.filter((user: User) => (user.first_name!+user.last_name!).toLowerCase().includes(filterValue));
  }
  createGroup(myForm: NgForm): void {
    if (myForm.valid) {
      if (!this.groupFeature[0].featureId?._id) {
        this.snackBarService.openSnackBar('Feature is required', 'error');
      } else {
        /*if (
          this.groupFeature.filter((value) => value.defaultFeature).length === 0 &&
          !this.user!.groupId
        ) {
          this.snackBarService.openSnackBar('Default feature is required for this user', 'error');
        } else {*/
        const final:GroupFeature[] = this.groupFeature.filter((x)=>x.featureId!=null)
        this.userFeaturesService.creatUserFeatures(this.user!, final).subscribe(() => {
            this._router.navigate([`../`], { relativeTo: this.route });
          },
        ()=>{
          console.log(this.groupFeature)

        });
      }
    }
  }

  resetForm(myForm: NgForm, event) {
    event.stopPropagation();
    if (myForm.pristine && this.featureId.length === 0) {
      myForm.resetForm();
    } else {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
        title: 'Clear',
        message: 'Would you like to clear the information ?',
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
          this.user = null;
          this.filteredList = [];
          this.filteredList.push(this.listFeature);
          this.featureId = [];
          this.groupFeature = [
            {
              featureId: null!,
              list: true,
              create: true,
              update: true,
              read: true,
              delete: true,
              status: true,
              defaultFeature: false,
            },
          ];
        }
      });
    }
  }

  cancelForm(myForm: NgForm) {
    if (myForm.pristine && this.featureId.length === 0) {
      this._router.navigate([`../`], { relativeTo: this.route });
    } else {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
        title: 'Cancel',
        message: 'Would you like to cancel the modification ?',
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
          this._router.navigate([`../`], { relativeTo: this.route });
        }
      });
    }
  }

  addRow(index, value): void {
    if (value) {
      this.featureId[index] = value;
      this.groupFeature[index].featureId = value;
      this.filteredList.push(this.listFeature);
      if (
        this.groupFeature[index] &&
        this.groupFeature.length - 1 === index &&
        this.groupFeature.length !== this.listFeature.length
      ) {
        this.groupFeature.push(new UserFeature());
        this.groupFeature[index + 1] = {
          list: true,
          create: true,
          read: true,
          update: true,
          delete: true,
          status: true,
          defaultFeature: false,
        };
      }
    } else {
      this.deleteRow(index);
    }
  }

  deleteRow(index) {
    this.groupFeature.splice(index, 1);
    this.featureId.splice(index, 1);
    if (this.groupFeature[this.groupFeature.length - 1].featureId) {
      this.groupFeature.push({
        featureId: null!,
        list: true,
        create: true,
        update: true,
        read: true,
        delete: true,
        status: true,
        defaultFeature: false,
      });
    }
  }


  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  grantAll(event) {
    event.stopPropagation();
    this.filteredList = this.listFeature.map(() => this.listFeature);
    this.featureId = this.listFeature.map((value) => value);
    this.groupFeature = this.listFeature.map((value) => ({
      featuresId: value,
      list: true,
      create: true,
      update: true,
      read: true,
      delete: true,
      status: true,
      defaultFeature: false,
    }));
    this.type = [true, true, true, true, true, true];
  }

  revokeAll(event) {
    event.stopPropagation();
    this.filteredList = [];
    this.filteredList.push(this.listFeature);
    this.featureId = [];
    this.groupFeature = [
      {
        featureId: null!,
        list: true,
        create: true,
        update: true,
        read: true,
        delete: true,
        status: true,
        defaultFeature: false,
      },
    ];
    this.type = [false, false, false, false, false, false];
  }

  activate(type: string) {
    for (const group of this.groupFeature) {
      if (type === 'list') {
        group.list = !this.type[0] ? true : false;
      }
      if (type === 'create') {
        group.create = !this.type[1] ? true : false;
      }
      if (type === 'read') {
        group.read = !this.type[2] ? true : false;
      }
      if (type === 'update') {
        group.update = !this.type[3] ? true : false;
      }
      if (type === 'delete') {
        group.delete = !this.type[4] ? true : false;
      }
      if (type === 'status') {
        if (!this.type[5]) {
          group.status = true;
        } else {
          group.status = false;
          group.defaultFeature = false;
        }
      }
    }
    if (type === 'list') {
      this.type[0] = !this.type[0];
    }
    if (type === 'create') {
      this.type[1] = !this.type[1];
    }
    if (type === 'read') {
      this.type[2] = !this.type[2];
    }
    if (type === 'update') {
      this.type[3] = !this.type[3];
    }
    if (type === 'delete') {
      this.type[4] = !this.type[4];
    }
    if (type === 'status') {
      this.type[5] = !this.type[5];
    }
  }

  testActivate(type: string) {
    if (type === 'list' && this.type[0]) {
      this.type[0] = false;
    }
    if (type === 'create' && this.type[1]) {
      this.type[1] = false;
    }
    if (type === 'read' && this.type[2]) {
      this.type[2] = false;
    }
    if (type === 'update' && this.type[3]) {
      this.type[3] = false;
    }
    if (type === 'delete' && this.type[4]) {
      this.type[4] = false;
    }
    if (type === 'status' && this.type[4]) {
      this.type[5] = false;
    }
  }

  default(index) {
    this.groupFeature.map((value) => {
      value.defaultFeature = false;
    });
    this.groupFeature[index].defaultFeature = true;
  }

  checkDefault(index) {
    if (
      !this.groupFeature[index].featureId ||
      !this.groupFeature[index].featureId.link ||
      !this.groupFeature[index].status
    ) {
      this.groupFeature[index].defaultFeature = false;
    }
  }
}
