import { ViewChild, ElementRef, Component } from '@angular/core';

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

  // Placeholder array of users
  users: User[] = [
    {'userID' : 1, 'name' : 'Kevin'},
    {'userID' : 2, 'name' : 'Jeff'},
    {'userID' : 3, 'name' : 'Bryan'},
    {'userID' : 4, 'name' : 'Gabbey'},
    {'userID' : 5, 'name' : 'Nathan'},
    {'userID' : 6, 'name' : 'Kyle'},
  ];

  // Template reference to the mention/user list popup
  @ViewChild('mentionList') mentionList: ElementRef | undefined;

  selectedUserIndex: number = 0;
  newCommentText = '';
  showMentionList = false;
  filteredUsers: User[] = []; // Filtered user list based on the @mention

  // Method to detect @mention in the comment input
  detectMention(event: KeyboardEvent) {
    const input: string = (event.target as HTMLInputElement).value;
    const lastWord: string | undefined = input.split(" ").pop();

    if (lastWord?.startsWith('@')) {
      // Do case-insensitive matching
      this.filteredUsers = this.users.filter(user => user.name.toLowerCase().startsWith(lastWord.substr(1).toLowerCase()));
      this.showMentionList = true;
    } else {
      this.showMentionList = false;
      this.selectedUserIndex = 0; // Reset index so that when popup reappears, selected user is at the top again
    }
  }

  // Method to handle key events
  handleKeydown(event: KeyboardEvent) {
    if (this.showMentionList && this.mentionList) {
      const list = this.mentionList.nativeElement;
      const items = list.getElementsByTagName('li');
      if (!items.length) return;

      // Enter key
      if (event.key === 'Enter') {
        event.preventDefault(); // Not really needed because pressing enter does NOT submit comment form
        this.selectUser(this.filteredUsers[this.selectedUserIndex].name);
      }

      // Arrow down
      if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent keying down in textbox
        if (this.selectedUserIndex < this.filteredUsers.length - 1) {
          this.selectedUserIndex++;
        } else {
          this.selectedUserIndex = 0;
          list.scrollTop = 0; // Reset scroll to top when moving from the last item to the first
        }

        // If the next item is below the visible area
        if (items[this.selectedUserIndex].offsetTop + items[this.selectedUserIndex].clientHeight > list.scrollTop + list.clientHeight) {
          list.scrollTop = items[this.selectedUserIndex].offsetTop + items[this.selectedUserIndex].clientHeight - list.clientHeight;
        }
      }

      // Arrow up
      if (event.key === 'ArrowUp') {
        event.preventDefault(); // Prevent keying down in textbox
        if (this.selectedUserIndex > 0) {
          this.selectedUserIndex--;
        } else {
          this.selectedUserIndex = this.filteredUsers.length - 1;
          list.scrollTop = list.scrollHeight; // Scroll to the bottom when moving from the first item to the last
        }

        // If the previous item is above the visible area
        if (items[this.selectedUserIndex].offsetTop < list.scrollTop) {
          list.scrollTop = items[this.selectedUserIndex].offsetTop;
        }
      }
    }
  }

  // Method to select a user from the mention list
  selectUser(userName: string) {
    // Replace partially finished '@' string with full username
    this.newCommentText = this.newCommentText.replace(/@(\w+)?$/, `@${userName}`);
    this.showMentionList = false;
    this.selectedUserIndex = 0;
  }

  // Method to add the comment to the comments array
  addComment() {
    if (this.newCommentText) {
      this.comments.push({
        text: this.newCommentText,
        timestamp: new Date().toString()
      });

      // Grab all mentioned users
      const mentionedUsers = this.users.filter(user => this.newCommentText.includes(`@${user.name}`));

      // Alert each mentioned user
      mentionedUsers.forEach(user => {
        alert(`Mentioned: ${user.name}`); // Or send email/push notification
      });

      this.newCommentText = '';
      this.showMentionList = false;
    }
  }

}
