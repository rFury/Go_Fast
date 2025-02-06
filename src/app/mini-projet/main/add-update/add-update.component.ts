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
import { Task } from '../main.component';

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
    console.log(this.taskForm.value)
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  
  ngOnInit(): void {
    if(this.data.importance != null){
      this.ch = 'Update';
      this.taskForm.setValue(this.data);
    }
  }
}
