import {inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Order } from '../Models/Order.model';
import { Pagination } from '../Models/Pagination.model';
import { Client } from '../Models/Client.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  endpoint = `${environment.api}/orders`;

  http = inject(HttpClient)

  addOrderAdmin(order:Order):Observable<any>{
    return this.http.post<any>(`${this.endpoint}/${order.client}`,{order});
  }
  addOrder(order:Order):Observable<any>{
    return this.http.post<any>(`${this.endpoint}`,{order});
  }
  getOrders(
    limit: string,
    page: string,
    search: string,
    filterStatus :string,
  ): Observable<Pagination<Order>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);

    searchParams = searchParams.append('page', page);
    
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    if (filterStatus) {
      searchParams = searchParams.append('filterStatus', filterStatus);
    }
    return this.http.get<Pagination<Order>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }
  deleteOrder(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.endpoint}/${id}`);
  }
  updateOrder(order: Order): Observable<null> {
    return this.http.put<null>(`${this.endpoint}/${order._id}`, { order });
  }
  getOrdersAgent(orderId: string): Observable<string> {
    return this.http.get<string>(`${this.endpoint}/agent/${orderId}`);
  }
  pickUpOrder(order: Order): Observable<Order | null> {
    return this.http.put<Order | null>(`${this.endpoint}/${order._id}/pick-up`,{});
  }
  deliverOrder(order: Order): Observable<null> {
    return this.http.put<null>(`${this.endpoint}/${order._id}/deliver`,{});
  }
}
