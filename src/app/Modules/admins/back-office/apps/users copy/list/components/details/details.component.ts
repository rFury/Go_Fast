import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatError, MatOption, MatSelect} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {forkJoin} from "rxjs";
import { FuseConfirmationService } from '../../../../../../../../Shared/Components/confirmation/confirmation.service';
import { Group } from '../../../../../../../../Shared/Models/Group.model';
import { User } from '../../../../../../../../Shared/Models/User.model';
import { GroupService } from '../../../../../../../../Shared/Services/group.service';
import { LoadingService } from '../../../../../../../../Shared/Services/loading.service';
import { UserService } from '../../../../../../../../Shared/Services/user.service';
import { MatIcon } from '@angular/material/icon';
import { HasPermissionDirective } from '../../../../../../../../Shared/directives/permission/has-permission.directive';
import { Client } from '../../../../../../../../Shared/Models/Client.model';
 @Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    standalone: true,
     imports: [
         FormsModule,
         MatButton,
         MatFormField,
         MatLabel,
         MatInput,
         ReactiveFormsModule,
         MatIcon,
         HasPermissionDirective
     ],
})
export class DetailsComponent implements OnInit {
     //********* INJECT SERVICES ***********//
     _userService= inject(UserService);
     _router= inject(Router);
     _route= inject(ActivatedRoute);
     _fuseConfirmationService= inject(FuseConfirmationService);
     _loadingService= inject(LoadingService);
     //********* DECLARE CLASSES/ENUMS ***********//
     id = this._route.snapshot.paramMap.get('id') || undefined;
     user: Client;
     ngOnInit(): void {
         if (this.id) {
             this._loadingService.show()
             forkJoin([
                 this._userService.getOne(this.id,'client'),
             ]).subscribe({
                 next: (result:[Client]) => {
                     this.user = result[0];
                     this._loadingService.hide()
                 },
                 error: () => {
                     this._loadingService.hide()
                 }
             });
         }
         
     }
    updateOne() {
        this._router.navigate([`/admin/dashboard/clients/${this.user._id}/edit`]).then();
    }
    deleteOne() {
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
                this._userService.deleteOne(this.user._id!).subscribe(() => {});
                this._router.navigate(['/admin/dashboard/clients']).then();
            }
        });
    }
}
