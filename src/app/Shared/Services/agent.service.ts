// src/app/services/location.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
    private endpoint = `${environment.api}/journey`;
    private http=inject(HttpClient);
    getJourney():Observable<any>{
        return this.http.get<any>(this.endpoint);
    }
}
