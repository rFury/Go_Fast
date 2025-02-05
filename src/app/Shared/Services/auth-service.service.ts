import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../app/Shared/Models/User.model';
import { HttpClient, HttpHeaders } from'@angular/common/http';
import { Observable } from 'rxjs';
import { auth_conf } from '../app/Shared/Models/auth-confirmation.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'myAppUserDataKey';
  User!:User;
  userCourant!: string;
  roleCourant!: string;
  isConnected!: boolean;

  constructor(private router:Router,private http: HttpClient) {
    this.loadData();
  }
    private apiUrl = "http://127.0.0.1:3000/api/users";
    AddUser(val:User): Observable<auth_conf> {
        return this.http.post<auth_conf>(this.apiUrl+"/registery",val)
    }

    getUserCourant():User 
    {
      return this.User;
    }
    disconnect() {
      this.isConnected = false;
      this.userCourant = '';
      this.roleCourant = '';
      //this.User=new UserModel();
      this.saveData();
      this.router.navigate(['/connect']);
    }
    testerAdmin(): boolean {
      return this.roleCourant === 'ADMIN';
    }

    saveData(): void {
      const data = {
        User: this.User,
        userCourant: this.userCourant,
        roleCourant: this.roleCourant,
        isConnected: this.isConnected,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  
    private loadData(): void {
      // Load data from localStorage
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        this.User = data.User;
        this.userCourant = data.userCourant;
        this.roleCourant = data.roleCourant;
        this.isConnected = data.isConnected;
      }
    }
  
    // Call this method whenever you want to update the data
    //updateUserData(users: UserModel): void {
      //this.User = users;
      /*this.userCourant = userCourant;
      this.roleCourant = roleCourant;
      this.isConnected = isConnected;*/
      // Save the updated data to localStorage
      //this.saveData();
    //}
}
