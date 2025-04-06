import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import {MatError, MatSelect, MatSelectTrigger} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {forkJoin} from "rxjs";
import {MatRadioButton} from "@angular/material/radio";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatTooltip} from "@angular/material/tooltip";
import { FuseConfirmationService } from '../../../../../../../../Shared/Components/confirmation/confirmation.service';
import { Feature } from '../../../../../../../../Shared/Models/Feature.model';
import { Group } from '../../../../../../../../Shared/Models/Group.model';
import { GroupFeature } from '../../../../../../../../Shared/Models/GroupFeature.model';
import { FeatureService } from '../../../../../../../../Shared/Services/feature.service';
import { GroupService } from '../../../../../../../../Shared/Services/group.service';
import { LoadingService } from '../../../../../../../../Shared/Services/loading.service';
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
        MatError,
        MatIcon,
        MatIconButton,
        MatOption,
        MatRadioButton,
        MatSelect,
        MatSelectTrigger,
        MatSlideToggle,
    ],
})
export class DetailsComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _groupService= inject(GroupService);
    _featureService= inject(FeatureService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    group = new Group();
    filteredList:Feature[][] = [];
    groupFeature: GroupFeature[];
    featureId: Feature[] = [];
    listFeature: Feature[] = [];
    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            forkJoin([
                this._groupService.getOne(this.id),
                this._groupService.getFeatureGroup(this.id),
                this._featureService.getAllFeature(),
            ]).subscribe({
                next: (result:[Group, GroupFeature[], Feature[] ]) => {
                    this.group = result[0];
                    this.groupFeature = result[1];
                    this.filteredList = this.listFeature.map(() => this.listFeature);
                    this.featureId = this.groupFeature
                    .map((value) => value.featureId)
                    .filter((feature): feature is Feature => feature !== undefined);
                console.log(this.groupFeature);
                
                    this._loadingService.hide()
                },
                error: () => {
                    this._loadingService.hide()
                }
            });
        }
    }
    updateOne() {
        this._router.navigate([`/admin/dashboard/groups/${this.group._id}/edit`]).then();
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
                this._groupService.deleteOne(this.group._id!).subscribe(() => {});
                this._router.navigate(['/admin/dashboard/groups']).then();
            }
        });
    }
}
