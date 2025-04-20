import {inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FeatureAuth } from '../Models/FeatureAuth.model';
import { Order } from '../Models/Order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  endpoint = `${environment.api}/orders`;

  http = inject(HttpClient)

  getOrders(): Observable<any> {
    return this.http.get<any>(`${this.endpoint}`);
  }

  addOrder(order:Order):Observable<any>{
    return this.http.post<any>(`${this.endpoint}`,{order});
  }
}
