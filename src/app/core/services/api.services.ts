import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoachResponse, CoachRequest, MentorResponse, MentorRequest,
         MentorConnectResponse, DashboardStats, ReportRow,
         CoachSessionRequest, CoachSessionResponse,
         DepartmentItem, VerticalItem } from '../../shared/models';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CoachApiService {
  constructor(private http: HttpClient) {}
  getCoaches(name?: string, dept?: string, active?: boolean): Observable<CoachResponse[]> {
    let p = new HttpParams();
    if (name) p = p.set('name', name);
    if (dept) p = p.set('dept', dept);
    if (active !== undefined) p = p.set('active', String(active));
    return this.http.get<CoachResponse[]>(`${API}/admin/coaches`, { params: p });
  }
  createCoach(req: CoachRequest): Observable<CoachResponse>          { return this.http.post<CoachResponse>(`${API}/admin/coaches`, req); }
  updateCoach(id: number, req: CoachRequest): Observable<CoachResponse>{ return this.http.put<CoachResponse>(`${API}/admin/coaches/${id}`, req); }
  deleteCoach(id: number): Observable<void>                           { return this.http.delete<void>(`${API}/admin/coaches/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class MentorApiService {
  constructor(private http: HttpClient) {}
  getMyMentors(name?: string, dept?: string, cohort?: string): Observable<MentorResponse[]> {
    let p = new HttpParams();
    if (name)   p = p.set('name', name);
    if (dept)   p = p.set('dept', dept);
    if (cohort) p = p.set('cohort', cohort);
    return this.http.get<MentorResponse[]>(`${API}/coach/mentors`, { params: p });
  }
  getAllMentors(name?: string, dept?: string): Observable<MentorResponse[]> {
    let p = new HttpParams();
    if (name) p = p.set('name', name);
    if (dept) p = p.set('dept', dept);
    return this.http.get<MentorResponse[]>(`${API}/admin/mentors`, { params: p });
  }
  getMentorById(id: number): Observable<MentorResponse>             { return this.http.get<MentorResponse>(`${API}/coach/mentors/${id}`); }
  getByAssociateId(aid: string): Observable<MentorResponse>         { return this.http.get<MentorResponse>(`${API}/coach/mentors/associate/${aid}`); }
  createMentor(req: MentorRequest): Observable<MentorResponse>      { return this.http.post<MentorResponse>(`${API}/coach/mentors`, req); }
  updateMentor(id: number, req: MentorRequest): Observable<MentorResponse>{ return this.http.put<MentorResponse>(`${API}/coach/mentors/${id}`, req); }
  deleteMentor(id: number): Observable<void>                         { return this.http.delete<void>(`${API}/coach/mentors/${id}`); }
  updateConnect(connectId: number, req: Partial<MentorConnectResponse>): Observable<MentorConnectResponse> {
    return this.http.put<MentorConnectResponse>(`${API}/coach/connects/${connectId}`, req);
  }
}

@Injectable({ providedIn: 'root' })
export class SessionApiService {
  constructor(private http: HttpClient) {}
  createSession(req: CoachSessionRequest): Observable<CoachSessionResponse>     { return this.http.post<CoachSessionResponse>(`${API}/coach/sessions`, req); }
  getMySessions(): Observable<CoachSessionResponse[]>                            { return this.http.get<CoachSessionResponse[]>(`${API}/coach/sessions`); }
  getUpcoming(): Observable<CoachSessionResponse[]>                              { return this.http.get<CoachSessionResponse[]>(`${API}/coach/sessions/upcoming`); }
}

@Injectable({ providedIn: 'root' })
export class MetaApiService {
  constructor(private http: HttpClient) {}
  getDepartments(): Observable<DepartmentItem[]>                                 { return this.http.get<DepartmentItem[]>(`${API}/departments`); }
  getVerticals(): Observable<VerticalItem[]>                                     { return this.http.get<VerticalItem[]>(`${API}/verticals`); }
  createDepartment(name: string, code: string): Observable<DepartmentItem>      { return this.http.post<DepartmentItem>(`${API}/admin/departments`, { name, code }); }
  deleteDepartment(id: number): Observable<void>                                 { return this.http.delete<void>(`${API}/admin/departments/${id}`); }
  createVertical(name: string): Observable<any>                                  { return this.http.post(`${API}/admin/verticals`, { name }); }
  deleteVertical(id: number): Observable<void>                                   { return this.http.delete<void>(`${API}/admin/verticals/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  constructor(private http: HttpClient) {}
  getAdminDashboard(): Observable<DashboardStats>                                { return this.http.get<DashboardStats>(`${API}/admin/dashboard`); }
  getCoachDashboard(): Observable<DashboardStats>                                { return this.http.get<DashboardStats>(`${API}/coach/dashboard`); }
  getReport(dept?: string, from?: string, to?: string): Observable<ReportRow[]> {
    let p = new HttpParams();
    if (dept) p = p.set('dept', dept);
    if (from) p = p.set('from', from);
    if (to)   p = p.set('to', to);
    return this.http.get<ReportRow[]>(`${API}/admin/reports`, { params: p });
  }
}

@Injectable({ providedIn: 'root' })
export class AgentApiService {
  constructor(private http: HttpClient) {}
  parse(text: string): Observable<any> {
    return this.http.post<any>(`${API}/coach/agent/parse`, { text });
  }
  save(text: string): Observable<any> {
    return this.http.post<any>(`${API}/coach/agent/save`, { text, autoSave: true });
  }
}
