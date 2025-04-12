import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';
import { FuseConfirmationService } from '../../../../../../../../Shared/Components/confirmation/confirmation.service';
import { Feature } from '../../../../../../../../Shared/Models/Feature.model';
import { User } from '../../../../../../../../Shared/Models/User.model';
import { UserFeature } from '../../../../../../../../Shared/Models/UserFeature.model';
import { FeatureService } from '../../../../../../../../Shared/Services/feature.service';
import { SnackBarService } from '../../../../../../../../Shared/Services/snack-bar.service';
import { UserService } from '../../../../../../../../Shared/Services/user.service';
import { UserFeaturesService } from '../../../../../../../../Shared/Services/userFeature.service';
import { environment } from '../../../../../../../../../environments/environment';
import { HasPermissionDirective } from '../../../../../../../../Shared/directives/permission/has-permission.directive';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatTooltip,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatSlideToggle,
    MatIconButton,
    HasPermissionDirective
  ],
})
export class EditComponent implements OnInit {
  isLoading: boolean;
  user = new User();
  url = `${environment}/assets/`;
  id: string;
  userFeature: UserFeature[];
  testGroup: UserFeature[];
  type: boolean[] = [true, true, true, true, true, true];
  index: number;
  label: string;
  usersId: User;
  featureFilterControls: FormControl<any> = new FormControl();
  constructor(
    private userFeaturesService: UserFeaturesService,
    private _router: Router,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private _fuseConfirmationService: FuseConfirmationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      this.id = param.get('id')!;

      if (this.id) {
        this.userFeaturesService.getUserFeature(this.id).subscribe(
          (user) => {
            this.user = user;
            this.label = `${this.user?.first_name} ${this.user?.last_name}`;
            this.breadcrumbService.set('home/userfeatures/:id', this.user.first_name!);
                this.userFeature = user.userFeaturesFull!;
                this.testGroup = user.userFeaturesFull!;

              },
              () => {},
        );
      }
    });
  }
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  delete() {
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
        /*this.userFeaturesService.deleteUser(this.id).subscribe(() => {
          this._router.navigate(['/home/userfeatures']);
        });*/
      }
    });
  }
  grantAll(event) {
    event.stopPropagation();
    for (let item of this.userFeature) {
      item.list=true;
      item.create=true;
      item.delete=true;
      item.read=true;
      item.update=true;
      item.status=true;

    }
  }

  revokeAll(event) {
    event.stopPropagation();
    for (let item of this.userFeature) {
      item.list=false;
      item.create=false;
      item.delete=false;
      item.read=false;
      item.update=false;
      item.list=false;
      item.status=false;
    }
  }
  deleteRow(index) {
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete',
      message: 'Would you like to delete this feature ?',
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
        this.userFeature.splice(index, 1);
      }
    });
  }
  
  cancelEdit(myForm: NgForm) {
    if (myForm.pristine && this.testGroup === this.userFeature) {
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
  update(): void {
        this.userFeaturesService.UpdateUserFeature(this.id,this.userFeature).subscribe(() => {
          this._router.navigate(['../../'], { relativeTo: this.route });
        });
  }
  activate(type: string) {

    for (const group of this.userFeature) {
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
    if (type === 'status' && this.type[5]) {
      this.type[5] = false;
    }
  }
  default(index) {
    this.userFeature.map((value) => {
      value.defaultFeature = false;
    });
    this.userFeature[index].defaultFeature = true;
  }

  checkDefault(index) {
    if (
      !this.userFeature[index].featureId ||
      !this.userFeature[index].featureId.link ||
      !this.userFeature[index].status
    ) {
      this.userFeature[index].defaultFeature = false;
    }
  }
}
