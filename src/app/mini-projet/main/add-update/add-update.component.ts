import { Component, inject, model, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators,ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MainService } from '../../Service/main.service';
import { response } from 'express';
import { Task } from '../../Service/main.service';

@Component({
  selector: 'app-add-update',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    MatDatepickerModule
  ],
  templateUrl: './add-update.component.html',
  styleUrl: './add-update.component.css',
})
export class AddUpdateComponent implements OnInit {

  constructor(private mainService: MainService){

  }

  minDate = new Date();
  ch = 'Add'
  readonly dialogRef = inject(MatDialogRef<AddUpdateComponent>);
  readonly data = inject<Task>(MAT_DIALOG_DATA);

  taskForm = new FormGroup({
    taskName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    taskDate: new FormControl('', [Validators.required]),
    taskDuration: new FormControl(0, [Validators.required, Validators.min(1)]),
    importance: new FormControl('', [Validators.required]),
  });

  onSubmit(){
    if(!this.taskForm.valid)return;
    let data = {
      taskName : this.taskForm.value.taskName!,
      taskDate : this.taskForm.value.taskDate!,
      taskDuration : this.taskForm.value.taskDuration!,
      importance : this.taskForm.value.importance!,

    }
    if(this.ch == 'Update'){
      this.mainService.updateTask(this.data._id!,data).subscribe({
        next : (res)=>{
          console.log(res);
        },
        error :(err)=>{
          console.log(err)
        }
      });
    }else if(this.ch == 'Add'){
      this.mainService.createTask(data).subscribe({
        next: (res) => {
          console.log('User registered:', res);
        },
        error: (err) => {
          console.error('Registration error:', err);
        }
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  
  ngOnInit(): void {
    if(this.data.importance != null){
      this.ch = 'Update';
      let filteredData = {
        taskName : this.data.taskName!,
        taskDate : this.data.taskDate!,
        taskDuration : this.data.taskDuration!,
        importance : this.data.importance!,
      }
      this.taskForm.setValue(filteredData);
    }
  }
}
