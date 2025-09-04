import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit {
  // to hold the name of the channel and currently logged in user info var into this.
  channelName: string | null = null;
  currentUser: any = null;

  constructor(private route: ActivatedRoute) {}

  // my lifecycle hook to run when the component is first created
  ngOnInit(): void {
    // look at the current route in url and find the chat/name and route it to the name of the channel.
    this.channelName = this.route.snapshot.paramMap.get('name');
    // read data from local storage. useing raw convert data from text to an object.
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      this.currentUser = JSON.parse(raw);
    }
  }
}
