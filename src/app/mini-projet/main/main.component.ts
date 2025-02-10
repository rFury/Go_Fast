import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  inject,
  model,
  signal,
} from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import { MainService } from '../Service/main.service';
import { Task } from '../Service/main.service';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
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
    MatListOption,
    FormsModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  @ViewChild(MatTable) table!: MatTable<Task>;
  original!:Task[];
  search: string= "";
  filter:any[]=[];
  filter_list_task!: Task[];
  displayedColumns: string[] = [
    'taskName',
    'taskDate',
    'taskDuration',
    'importance',
    "done",
    'actions',
  ];
  dataSource = new MatTableDataSource<Task>([]);
  Importance = [
    { name: 'High'},
    { name: 'Moderate'},
    { name: 'Low'},
  ];

  constructor(private mainService: MainService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.mainService.getTasks().subscribe({
      next: (res) => {
        setTimeout(() => {
          this.dataSource.data = res;
          this.original = res;
          this.table?.renderRows();
        });
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }
  openDialog(index: number): void {
    let data = index !== -1 ? this.dataSource.data[index] : {};

    const dialogRef = this.dialog.open(AddUpdateComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.fetchTasks();
    });
  }

  deleteTask(id: string): void {
    this.mainService.deleteTask(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((task) => task._id !== id);
        this.table?.renderRows();
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }


  taskFilter(){
    console.log(this.filter);
    console.log(this.search);
    let temp_task = this.original;
    const query = this.search.toLowerCase().replace(/\s+/g, ' ').trim();
    if(query) temp_task = this.original.filter(e=>e.taskName.toLowerCase().includes(query.toLowerCase()))



      let x = this.filter.length;
    if(x>0) temp_task=temp_task.filter(e=>e.importance==this.filter[x-1].name);


    this.dataSource.data = temp_task
    this.table.renderRows();

  }
}
