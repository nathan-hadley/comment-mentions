import { Component } from '@angular/core';

interface User {
  userID: number;
  name: string;
}

interface Comment {
  text: string;
  timestamp: string;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  comments: Comment[] = [];

  users: User[] = [
    {'userID' : 1, 'name' : 'Kevin'},
    {'userID' : 2, 'name' : 'Jeff'},
    {'userID' : 3, 'name' : 'Bryan'},
    {'userID' : 4, 'name' : 'Gabbey'}
  ];

  newComment = '';         // Model for the comment input field
  showMentionList = false; // Flag to show/hide the mention list
  filteredUsers: User[] = [];     // Filtered user list based on the @mention

  // Method to detect @mention in the comment input
  detectMention(event: KeyboardEvent) {
    const input: string = (event.target as HTMLInputElement).value;
    const lastWord: string | undefined = input.split(" ").pop();

    if (lastWord?.startsWith('@')) {
      this.filteredUsers = this.users.filter(user => user.name.toLowerCase().startsWith(lastWord.substr(1).toLowerCase()));
      this.showMentionList = true;
    } else {
      this.showMentionList = false;
    }
  }

  // Method to add the comment to the comments array
  addComment() {
    if (this.newComment) {
      this.comments.push({
        text: this.newComment,
        timestamp: new Date().toString()
      });

      const mentionedUsers = this.users.filter(user => this.newComment.includes(`@${user.name}`));
      mentionedUsers.forEach(user => {
        alert(`Mentioned: ${user.name}`);
      });

      this.newComment = '';
      this.showMentionList = false;
    }
  }

  // Method to select a user from the mention list
  selectUser(userName: string) {
    this.newComment = this.newComment.replace(/@\w+$/, `@${userName}`);
    this.showMentionList = false;
  }
}
