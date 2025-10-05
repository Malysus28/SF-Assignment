import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService, ChatMessage } from '../../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  // channel + user
  channelName: string | null = null;
  currentUser: any = null;

  // chat state
  messages: ChatMessage[] = [];
  messageText = '';
  systemEvents: { text: string; ts: number }[] = [];
  onlineUsers: string[] = [];

  constructor(private route: ActivatedRoute, private sockets: SocketService) {}

  ngOnInit(): void {
    // get channel from route
    this.channelName = this.route.snapshot.paramMap.get('name');

    // load current user from localStorage
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      try {
        this.currentUser = JSON.parse(raw);
      } catch {
        this.currentUser = null;
      }
    }

    // join & subscribe to events
    if (this.channelName && this.currentUser) {
      this.sockets.join(this.channelName, {
        username: this.currentUser.username,
      });

      //history on join
      this.sockets.onHistory().subscribe((list) => {
        this.messages = Array.isArray(list) ? list : [];
      });

      // live messages
      this.sockets.onMessage().subscribe((msg) => {
        if (msg.channel === this.channelName) this.messages.push(msg);
      });

      // join/leave system events
      this.sockets.onSystem().subscribe((evt) => {
        const who = evt?.user?.username ?? 'someone';
        const text = evt?.type === 'join' ? `${who} joined` : `${who} left`;
        this.systemEvents.push({ text, ts: evt.ts || Date.now() });
      });

      // presence/online list
      this.sockets.onPresence().subscribe((list) => {
        this.onlineUsers = Array.isArray(list) ? list : [];
      });
    }
  }

  send() {
    if (!this.messageText.trim() || !this.channelName || !this.currentUser)
      return;

    const msg: ChatMessage = {
      channel: this.channelName,
      user: { username: this.currentUser.username },
      text: this.messageText.trim(),
      ts: Date.now(),
    };

    this.sockets.sendMessage(msg);
    this.messageText = '';
  }

  ngOnDestroy(): void {
    this.sockets.leave();
  }
}
