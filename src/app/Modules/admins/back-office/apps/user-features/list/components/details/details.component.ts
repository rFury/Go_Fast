import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { environment } from '../../../../../../../../../environments/environment';
import { FuseConfirmationService } from '../../../../../../../../Shared/Components/confirmation/confirmation.service';
import { Feature } from '../../../../../../../../Shared/Models/Feature.model';
import { User } from '../../../../../../../../Shared/Models/User.model';
import { UserFeature } from '../../../../../../../../Shared/Models/UserFeature.model';
import { FeatureService } from '../../../../../../../../Shared/Services/feature.service';
import { SnackBarService } from '../../../../../../../../Shared/Services/snack-bar.service';
import { UserService } from '../../../../../../../../Shared/Services/user.service';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatProgressBar,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatSelectTrigger,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatOption,
    MatSlideToggle,
    MatRadioButton,
    MatIconButton,
  ],
})
export class DetailsComponent implements OnInit {
  isLoading: boolean;
  user = new User();
  url = `${environment.api}/assets/`;
  id: string;
  userFeature: UserFeature[];
  featureId: Feature[] = [];
  listFeature: Feature[] = [];
  filteredList:Feature[][] = [];
  label: string;
  featureFilterControl: FormControl<any> = new FormControl();
  constructor(
    private userService: UserService,
    private featureService: FeatureService,
    private _router: Router,
    private snackBarService: SnackBarService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private _fuseConfirmationService: FuseConfirmationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      this.id = param.get('id')!;
      if (this.id) {
        this.featureService.getAllFeature().subscribe(
          (feature) => {
            this.listFeature = feature;

            this.filteredList.push(this.listFeature);
          },
          () => {},
        );
        this.userService.getSingleUserProfile(this.id).subscribe(
          (user) => {
            this.user = user;
            this.label = `${this.user?.name}(${this.user?.email})`;
            this.breadcrumbService.set('/admin/dashboard/userfeatures/:id', this.user.name!);
            this.userFeaturesService.getUserFeatures(this.user._id).subscribe(
              (userFeature) => {
                this.userFeature = userFeature;
                this.filteredList = this.listFeature.map(() => this.listFeature);
              },
              () => {},
            );
          },
          () => {},
        );
      }
    });
  }
  addUser() {
    this._router.navigate(['/admin/dashboard/userfeatures/add']);
  }

  editUser() {
    this._router.navigate([`/admin/dashboard/userfeatures/${this.user._id}/edit`]);
  }
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  deleteUser() {
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
        this.userFeaturesService.deleteUser(this.id).subscribe(() => {
          this._router.navigate(['/home/userfeatures']);
        });
      }
    });
  }
}
