import { Component, inject, signal, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { Router, RouterOutlet} from '@angular/router';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { SuperAuthService } from '../../../Shared/Services/super-auth-service.service';
import { UserService } from '../../../Shared/Services/user.service';


@Component({
  selector: 'app-back-office',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    RouterOutlet
],
  templateUrl: './back-office.component.html',
  styleUrls: ['./back-office.component.css']
})
export class BackOfficeComponent implements OnDestroy, OnInit {
  protected readonly isMobile = signal(false);
  protected expanded=false;
  
  searchForm = new FormGroup({
    search: new FormControl('', [Validators.required])
  });

  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  @ViewChild('drawer') drawer!: MatDrawer;

  constructor() {
    const media = inject(MediaMatcher);
    this._mobileQuery = media.matchMedia('(max-width: 639px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  search() {
    if (this.searchForm.valid) {
      console.log('Search value:', this.searchForm.value.search);
    }
  }

  searchToggle(){
    console.log("Search toggle clicked");
  }

  toggleDrawer() {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }
}
