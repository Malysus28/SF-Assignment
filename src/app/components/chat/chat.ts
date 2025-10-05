import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService, ChatMessage } from '../../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit {
  // to hold the name of the channel and currently logged in user info var into this.
  channelName: string | null = null;
  currentUser: any = null;

  // chat state
  messages: ChatMessage[] = [];
  messageText = '';

  constructor(private route: ActivatedRoute, private sockets: SocketService) {}

  // my lifecycle hook to run when the component is first created
  ngOnInit(): void {
    // look at the current route in url and find the chat/name and route it to the name of the channel.
    this.channelName = this.route.snapshot.paramMap.get('name');
    // read data from local storage. useing raw convert data from text to an object.
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      try {
        this.currentUser = JSON.parse(raw);
      } catch {
        this.currentUser = null;
      }
    }

    // join and start listening
    if (this.channelName && this.currentUser) {
      this.sockets.join(this.channelName, {
        username: this.currentUser.username,
      });

      this.sockets.onMessage().subscribe((msg) => {
        // keep only messages for this channel
        if (msg.channel === this.channelName) {
          this.messages.push(msg);
        }
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
}
