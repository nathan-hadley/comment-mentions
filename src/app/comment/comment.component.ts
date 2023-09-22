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

  users: User[] = [
    {'userID' : 1, 'name' : 'Kevin'},
    {'userID' : 2, 'name' : 'Jeff'},
    {'userID' : 3, 'name' : 'Bryan'},
    {'userID' : 4, 'name' : 'Gabbey'},
    {'userID' : 5, 'name' : 'Nathan'},
    {'userID' : 6, 'name' : 'Kyle'},
  ];

  @ViewChild('mentionList') mentionList: ElementRef | undefined;

  selectedIndex: number = 0;
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
      this.selectedIndex = 0;
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

  handleKeydown(event: KeyboardEvent) {
    if (this.showMentionList && this.mentionList) {
      const list = this.mentionList.nativeElement;
      const items = list.getElementsByTagName('li');
      if (!items.length) return;

      // Enter key
      if (event.key === 'Enter') {
        event.preventDefault();
        this.selectUser(this.filteredUsers[this.selectedIndex].name);
      }

      // Arrow down
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (this.selectedIndex < this.filteredUsers.length - 1) {
          this.selectedIndex++;
        } else {
          this.selectedIndex = 0;
          list.scrollTop = 0; // Reset scroll to top when moving from the last item to the first
        }

        // If the next item is below the visible area
        if (items[this.selectedIndex].offsetTop + items[this.selectedIndex].clientHeight > list.scrollTop + list.clientHeight) {
          list.scrollTop = items[this.selectedIndex].offsetTop + items[this.selectedIndex].clientHeight - list.clientHeight;
        }
      }

      // Arrow up
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
        } else {
          this.selectedIndex = this.filteredUsers.length - 1;
          list.scrollTop = list.scrollHeight; // Scroll to the bottom when moving from the first item to the last
        }

        // If the previous item is above the visible area
        if (items[this.selectedIndex].offsetTop < list.scrollTop) {
          list.scrollTop = items[this.selectedIndex].offsetTop;
        }
      }
    }
  }

  // Method to select a user from the mention list
  selectUser(userName: string) {
    this.newComment = this.newComment.replace(/@(\w+)?$/, `@${userName}`);
    this.showMentionList = false;
    this.selectedIndex = 0;
  }

}
