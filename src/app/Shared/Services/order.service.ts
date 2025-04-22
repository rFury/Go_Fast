import {inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FeatureAuth } from '../Models/FeatureAuth.model';
import { Order } from '../Models/Order.model';
import { Pagination } from '../Models/Pagination.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  endpoint = `${environment.api}/orders`;

  http = inject(HttpClient)

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
}
