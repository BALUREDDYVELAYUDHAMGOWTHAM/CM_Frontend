import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AgentApiService } from '../../../core/services/api.services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  parsed?: any;
  showForm?: boolean;
  saved?: boolean;
  isTrackerUpdate?: boolean;
  isBulkUpdate?: boolean;
  trackerData?: any;
  bulkResults?: any[];
  timestamp: Date;
}

@Component({
  selector: 'app-agent-chat',
  templateUrl: './agent-chat.component.html',
  styleUrls: ['./agent-chat.component.scss']
})
export class AgentChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBottom') chatBottom!: ElementRef;

  messages: ChatMessage[] = [];
  inputText = '';
  loading   = false;
  lastResponse: any = null;

  suggestions = [
    { label: 'Bulk Update',     text: 'update 1 hr virtual for Arun and Divya on 2nd Apr' },
    { label: 'Bulk 3 Mentors',  text: 'update 1.5 hrs in person for Arun, Divya and Meena on 15 Mar' },
    { label: 'Single Update',   text: 'update 1 hr for Divya Nair on 2nd Apr' },
    { label: 'New Session',     text: 'virtual session with Arun Kumar today from 10am to 11:30am' },
  ];

  constructor(
    private agentApi: AgentApiService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.messages.push({
      role: 'agent',
      text: `👋 Hi! I'm your Session Agent.\n\n` +
            `I support two types of updates:\n\n` +
            `🗓 **Single Update:**\n"update 1 hr for Divya Nair on 2nd Apr"\n\n` +
            `👥 **Bulk Update (multiple mentors at once):**\n"update 1 hr virtual for Arun, Divya and Meena on 2nd Apr"\n\n` +
            `📋 **New Session:**\n"virtual session with Arun today from 10am to 11:30am"`,
      timestamp: new Date()
    });
  }

  ngAfterViewChecked(): void { this.scrollToBottom(); }

  useSuggestion(s: string): void { this.inputText = s; this.send(); }

  send(): void {
    if (!this.inputText.trim() || this.loading) return;
    const userText = this.inputText.trim();
    this.inputText = '';
    this.messages.push({ role: 'user', text: userText, timestamp: new Date() });
    this.loading = true;

    this.agentApi.parse(userText).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.lastResponse = res;

        this.messages.push({
          role: 'agent',
          text: res.confirmationMessage,
          showForm: res.complete,
          isTrackerUpdate: res.trackerUpdate,
          isBulkUpdate: res.bulkUpdate,
          trackerData: res.trackerUpdate ? res : null,
          parsed: res.parsed,
          timestamp: new Date()
        });
      },
      error: () => {
        this.loading = false;
        this.messages.push({ role: 'agent', text: '❌ Could not process. Please try again.', timestamp: new Date() });
      }
    });
  }

  confirmSave(msgIndex: number): void {
    if (!this.lastResponse) return;
    this.loading = true;
    const msg = this.messages[msgIndex];

    this.agentApi.save(this.lastResponse.originalText).subscribe({
      next: (res: any) => {
        this.loading = false;
        msg.showForm    = false;
        msg.saved       = true;
        msg.bulkResults = res.bulkResults;

        this.messages.push({
          role: 'agent',
          text: res.confirmationMessage,
          isTrackerUpdate: res.trackerUpdate,
          isBulkUpdate: res.bulkUpdate,
          bulkResults: res.bulkResults,
          timestamp: new Date()
        });

        const savedCount = res.bulkResults
          ? res.bulkResults.filter((r: any) => r.saved).length
          : (res.saved ? 1 : 0);

        this.snack.open(
          res.bulkUpdate
            ? `${savedCount} mentors updated in tracker!`
            : res.trackerUpdate ? 'Tracker updated!' : 'Session saved!',
          'Close', { duration: 3000 }
        );
      },
      error: err => {
        this.loading = false;
        this.messages.push({
          role: 'agent',
          text: '❌ Save failed: ' + (err.error?.error ?? 'Unknown error'),
          timestamp: new Date()
        });
      }
    });
  }

  cancelSave(msgIndex: number): void {
    this.messages[msgIndex].showForm = false;
    this.messages.push({ role: 'agent', text: '↩️ Cancelled.', timestamp: new Date() });
  }

  goToTracker(): void {
    this.router.navigateByUrl('/coach/dashboard', { skipLocationChange: true })
      .then(() => this.router.navigate(['/coach/tracker']));
  }

  onEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  scrollToBottom(): void {
    try { this.chatBottom?.nativeElement?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  formatText(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  getFieldLabel(key: string): string {
    const labels: Record<string, string> = {
      mentorName:'Mentor', associateId:'Associate ID', mode:'Mode',
      sessionDate:'Date', fromTime:'From', toTime:'To', hours:'Hours',
      batchOwnerName:'Batch Owner', notes:'Notes'
    };
    return labels[key] ?? key;
  }

  getParsedEntries(parsed: any): {key: string; value: any}[] {
    if (!parsed) return [];
    return ['mentorName','associateId','mode','sessionDate','fromTime','toTime','hours','batchOwnerName','notes']
      .filter(k => parsed[k]).map(k => ({ key: k, value: parsed[k] }));
  }

  getTrackerEntries(data: any): {key: string; value: any}[] {
    if (!data) return [];
    const map: Record<string, string> = {
      mentorName:'Mentor', weekRange:'Week', hours:'Hours', mode:'Mode', sessionDate:'Date'
    };
    return Object.keys(map).filter(k => data[k]).map(k => ({ key: map[k], value: data[k] }));
  }
}
