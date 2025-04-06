import {inject, Injectable} from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../Models/Group.model';
import { GroupFeature } from '../Models/GroupFeature.model';
import { Pagination } from '../Models/Pagination.model';
@Injectable({
  providedIn: 'root',
})
export class GroupService {
  endpoint = `${environment.api}/groups`;

  http = inject(HttpClient)
  // get groups
  getList(
      limit: string,
      page: string,
      search: string,
      filterType:string,
      filterStatus:string,
  ): Observable<Pagination<Group>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);
    searchParams = searchParams.append('page', page);
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    if (filterType) {
      searchParams = searchParams.append('filterType', filterType);
    }
    if (filterStatus) {
      searchParams = searchParams.append('filterStatus', filterStatus);
    }
    return this.http.get<Pagination<Group>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
  getOne(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.endpoint}/${id}`);
  }
  getAll(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.endpoint}/all`);
  }
  createOne(group: Group, groupFeature: GroupFeature[]): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { group, groupFeature });
  }
  updateOne(group: Group, groupFeature: GroupFeature[]): Observable<null> {
    return this.http.put<null>(`${this.endpoint}/${group._id}`, { group, groupFeature });
  }
  getFeatureGroup(id: string): Observable<GroupFeature[]> {
        return this.http.get<GroupFeature[]>(`${this.endpoint}/${id}/group-feature`);
  }

}
