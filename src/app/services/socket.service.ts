import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export type ChatMessage = {
  channel: string;
  user: { username: string };
  text: string;
  ts: number;
};

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket = io('http://localhost:3000', {
    transports: ['websocket'],
  });

  join(channel: string, user: { username: string }) {
    this.socket.emit('join', { channel, user });
  }

  leave() {
    this.socket.emit('leave');
  }

  sendMessage(msg: ChatMessage) {
    this.socket.emit('chat:message', msg);
  }

  onMessage(): Observable<ChatMessage> {
    return new Observable((observer) => {
      const h = (m: ChatMessage) => observer.next(m);
      this.socket.on('chat:message', h);
      return () => this.socket.off('chat:message', h);
    });
  }

  // NEW: history on join
  onHistory(): Observable<ChatMessage[]> {
    return new Observable((observer) => {
      const h = (list: ChatMessage[]) => observer.next(list);
      this.socket.on('chat:history', h);
      return () => this.socket.off('chat:history', h);
    });
  }

  // NEW: join/leave events
  onSystem(): Observable<{
    type: 'join' | 'leave';
    user: { username: string };
    ts: number;
  }> {
    return new Observable((observer) => {
      const h = (evt: any) => observer.next(evt);
      this.socket.on('system:event', h);
      return () => this.socket.off('system:event', h);
    });
  }

  onPresence(): Observable<string[]> {
    return new Observable((observer) => {
      const h = (list: string[]) => observer.next(list);
      this.socket.on('presence', h);
      return () => this.socket.off('presence', h);
    });
  }
}
