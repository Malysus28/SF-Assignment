import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type Group = { id: string; name: string };

@Component({
  selector: 'app-groups-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-page.html',
})
export class GroupsPage implements OnInit {
  user: any = null;

  // what we get to use
  myGroupNames: string[] = [];
  availableGroupNames: string[] = [];

  // hardcode readonly  all groups
  private readonly ALL_GROUPS: Group[] = [
    { id: 'g1', name: 'Peer Mentors' },
    { id: 'g2', name: 'Griffith Coding Club' },
    { id: 'g3', name: 'PASS Study Group' },
  ];

  ngOnInit(): void {
    //read currentUser from localStorage
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      try {
        this.user = JSON.parse(raw);
      } catch {
        this.user = null;
      }
    }
    if (!this.user) return;

    //collect the user's group IDs
    const idsFromUser: string[] = Array.isArray(this.user?.groups)
      ? this.user.groups
      : [];
    const namesFromUser: string[] = Array.isArray(this.user?.groupNames)
      ? this.user.groupNames
      : [];

    // map names -> ids
    const nameToId = new Map(this.ALL_GROUPS.map((g) => [g.name, g.id]));
    const idsFromNames = namesFromUser
      .map((n) => nameToId.get(n))
      .filter((v): v is string => !!v);

    const memberIds = new Set<string>([...idsFromUser, ...idsFromNames]);

    // compute lists
    this.myGroupNames = this.ALL_GROUPS.filter((g) => memberIds.has(g.id)).map(
      (g) => g.name
    );
    this.availableGroupNames = this.ALL_GROUPS.filter(
      (g) => !memberIds.has(g.id)
    ).map((g) => g.name);

    // console.log('user', this.user);
    // console.log('myGroupNames', this.myGroupNames);
    // console.log('availableGroupNames', this.availableGroupNames);
  }
  register(groupName: string) {
    //replace with  API call later if i have time for this
    alert(`Registered interest for: ${groupName}`);
  }
}
