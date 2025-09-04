import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit {
  channelName: string | null = null;
  currentUser: any = null; // to hold current user info

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the channel name from the URL
    this.channelName = this.route.snapshot.paramMap.get('name');

    const raw = localStorage.getItem('currentUser');
    if (raw) {
      this.currentUser = JSON.parse(raw);
    }
  }
}
