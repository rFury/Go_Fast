import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectionList } from '@angular/material/list';
import { MatListOption } from '@angular/material/list';
import { AddUpdateComponent } from './add-update/add-update.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-main',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSelectionList,
    MatListOption
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class MainComponent {

  displayedColumns: string[] = ['taskName', 'taskDate', 'taskDuration', 'importance', 'actions'];
  dataSource: Task[] = [
    { taskName: '1iMac 27"', taskDate: 'yy-mm-dd', taskDuration: 1, importance: '300' },
    { taskName: '1iMac 27"', taskDate: 'yy-mm-dd', taskDuration: 1, importance: '300' },
    { taskName: '1iMac 27"', taskDate: 'yy-mm-dd', taskDuration: 1, importance: '300' },
    { taskName: '1iMac 27"', taskDate: 'yy-mm-dd', taskDuration: 1, importance: '300' },
    { taskName: '1iMac 27"', taskDate: 'yy-mm-dd', taskDuration: 1, importance: '300' },
    { taskName: '1iMac 27"', taskDate: 'yy-mm-dd', taskDuration: 1, importance: '300' },

  ];

  Importance = [
    { name: 'High', count: 56 },
    { name: 'Medium', count: 16 },
    { name: 'Low', count: 49 },
  ];

  //dialog 
  readonly dialog = inject(MatDialog);

  openDialog(index:number): void {

    let data = {};
    if(index != -1 ){
      data = this.dataSource[index];
    }
    const dialogRef = this.dialog.open(AddUpdateComponent, {
      data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
    });
  }

}

export interface Task {
  taskName: string;
  taskDate: string;
  taskDuration: number;
  importance: string;
}