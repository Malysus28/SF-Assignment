import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Channel = { id: string; groupId: string; name: string; des: string };

//tired of trying to get this from the api call at this point so i hardcoded it
const CHANNELS: Channel[] = [
  {
    id: 'c1',
    groupId: 'g1',
    name: 'Upcoming Workshops for Trimester 1',
    des: 'Workshops related to the upcoming trimester.',
  },
  {
    id: 'c2',
    groupId: 'g1',
    name: 'Events hosted by Peer Mentors',
    des: 'Events organized by peer mentors for guidance.',
  },
  {
    id: 'c3',
    groupId: 'g1',
    name: 'Ask us Anything',
    des: 'A channel for open questions and discussions.',
  },
  {
    id: 'c4',
    groupId: 'g2',
    name: 'Hackathon Info',
    des: 'Information about the upcoming hackathon.',
  },
  {
    id: 'c5',
    groupId: 'g2',
    name: 'ICPC Competition',
    des: 'Details about the ICPC competition.',
  },
  {
    id: 'c6',
    groupId: 'g2',
    name: 'Q&A',
    des: 'A channel for questions and answers.',
  },
  {
    id: 'c7',
    groupId: 'g3',
    name: 'Interaction Design Module',
    des: 'Discussion about the Interaction Design module.',
  },
  {
    id: 'c8',
    groupId: 'g3',
    name: 'Software Frameworks Module',
    des: 'Discussion about the Software Frameworks module.',
  },
  {
    id: 'c9',
    groupId: 'g3',
    name: 'Web App Dev Module',
    des: 'Discussion about the Web App Development module.',
  },
];

@Component({
  selector: 'app-channels-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './channels-page.html',
  styleUrls: ['./channels-page.css'],
})
export class ChannelsPage implements OnInit {
  // this is empty because when user logs in it can be filled in later.
  channels: Channel[] = [];

  // my lifecycle method which reads the user info from local storage and then filters the channels based on the groups the user belongs to.
  // get groups .
  ngOnInit(): void {
    const raw = localStorage.getItem('currentUser');
    if (!raw) {
      this.channels = [];
      return;
    }
    const user = JSON.parse(raw);
    const groupIds = user.groups;
    if (!groupIds.length) {
      this.channels = [];
      return;
    }
    // using includes i check if this channel belong to the usergroup
    this.channels = CHANNELS.filter((ch) => groupIds.includes(ch.groupId));
  }
}
