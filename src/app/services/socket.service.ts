import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export interface ChatMessage {
  channel: string;
  user: { username: string };
  text: string;
  ts: number;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // connect to your Socket.IO server
    this.socket = io('http://localhost:3000', { transports: ['websocket'] });
  }

  join(channel: string, user: { username: string }) {
    this.socket.emit('join', { channel, user });
  }

  sendMessage(msg: ChatMessage) {
    this.socket.emit('chat:message', msg);
  }

  onMessage(): Observable<ChatMessage> {
    return new Observable((observer) => {
      const handler = (msg: ChatMessage) => observer.next(msg);
      this.socket.on('chat:message', handler);
      return () => this.socket.off('chat:message', handler);
    });
  }
}
