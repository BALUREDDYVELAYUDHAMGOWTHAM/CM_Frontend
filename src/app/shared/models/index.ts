export type UserRole = 'ADMIN' | 'COACH';
export type TrainingStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED';
export type MentorConnectMode = 'VIRTUAL' | 'IN_PERSON' | 'HYBRID' | 'NOT_HAPPENED';

export interface AuthResponse {
  token: string; role: UserRole; fullName: string; userId: number; email: string; department?: string;
}
export interface LoginRequest { email: string; password: string; }

export interface DepartmentItem { id: number; name: string; code: string; active: boolean; }
export interface VerticalItem   { id: number; name: string; active: boolean; }

export interface MentorConnectResponse {
  id: number; mentorId: number; mentorName: string; weekRange: string; weekNumber: number;
  happened: boolean; mode?: string; connectDate?: string; hours?: number; reason?: string;
}

export interface MentorResponse {
  id: number; fullName: string; email: string; associateId: string; department: string;
  cohortCode: string; contact: string; verticalMapping: string; notes: string;
  trainingStatus: TrainingStatus; coachName: string; coachEmail: string; coachId: number;
  totalSessions: number; totalHours: number; connects: MentorConnectResponse[]; createdAt: string;
}

export interface MentorRequest {
  fullName: string; email: string; associateId?: string; department: string;
  cohortCode?: string; contact?: string; verticalMapping?: string; notes?: string; trainingStatus?: string;
}

export interface CoachSessionRequest {
  mentorId: number; batchOwnerId?: string; batchOwnerName?: string;
  sessionDate: string; fromTime: string; toTime: string; notes?: string;
}

export interface CoachSessionResponse {
  id: number; mentorId: number; mentorName: string; associateId: string;
  mentorEmail: string; department: string; cohortCode: string; contact: string;
  verticalMapping: string; trainingStatus: string; coachName: string;
  batchOwnerId: string; batchOwnerName: string; sessionDate: string;
  fromTime: string; toTime: string; hours: number; notes: string; createdAt: string;
}

export interface CoachResponse {
  id: number; fullName: string; email: string; department: string;
  contact: string; active: boolean; mentorCount: number; createdAt: string;
}
export interface CoachRequest {
  fullName: string; email: string; department: string; contact: string; active: boolean; notes?: string;
}
export interface ReportRow {
  mentorName: string; department: string; cohortCode: string; coachName: string;
  totalSessions: number; totalHours: number; avgDuration: number;
}
export interface DashboardStats {
  totalMentors?: number; activeCoaches?: number; sdetCount?: number; dotnetCount?: number;
  totalSessions?: number; totalHours?: number; myMentors?: number; sessionsThisMonth?: number;
  upcomingSessions?: number; cohortsAssigned?: number;
  deptDistribution?: Record<string, number>; recentActivity?: ActivityLog[];
}
export interface ActivityLog {
  id: number; activityType: string; description: string;
  performedBy: string; targetEntity: string; createdAt: string;
}
export const WEEK_RANGES = [
  '19 Jan - 23 Jan','27 Jan - 30 Jan','2 Feb - 6 Feb','9 Feb - 13 Feb',
  '16 Feb - 20 Feb','23 Feb - 27 Feb','2 Mar - 6 Mar','9 Mar - 13 Mar',
  '16 Mar - 19 Mar','23 Mar - 27 Mar','30 Mar - 03 Apr','06 Apr - 10 Apr',
  '13 Apr - 17 Apr','20 Apr - 24 Apr'
];
