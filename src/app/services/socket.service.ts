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

  // to join a chat channel as specific user
  join(channel: string, user: { username: string }) {
    this.socket.emit('join', { channel, user });
  }
  // tell server user is leaving
  leave() {
    this.socket.emit('leave');
  }
  // send a chat msg to the current channel
  sendMessage(msg: ChatMessage) {
    this.socket.emit('chat:message', msg);
  }
  // stream of live chat messages coming + payload
  onMessage(): Observable<ChatMessage> {
    return new Observable((observer) => {
      const h = (m: ChatMessage) => observer.next(m);
      this.socket.on('chat:message', h);
      return () => this.socket.off('chat:message', h);
    });
  }

  // history when user joins
  onHistory(): Observable<ChatMessage[]> {
    return new Observable((observer) => {
      const h = (list: ChatMessage[]) => observer.next(list);
      this.socket.on('chat:history', h);
      return () => this.socket.off('chat:history', h);
    });
  }

  // join and leave
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
  // track online users.
  onOnlineUser(): Observable<string[]> {
    return new Observable((observer) => {
      const h = (list: string[]) => observer.next(list);
      this.socket.on('onlineUsers', h);
      return () => this.socket.off('onlineUsers', h);
    });
  }
}
