import { ViewChild, ElementRef, Component, Renderer2, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { User } from "../app.component";

interface Comment {
  text: string;
  parsedText?: string;
  timestamp: string;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  @Input() users: User[] = [];

  comments: Comment[] = [];

  // Template reference to the mention/user list popup
  @ViewChild('mentionList') mentionList: ElementRef | undefined;

  selectedUserIndex: number = 0;
  newCommentText: string = '';
  showMentionList: boolean = false;
  filteredUsers: User[] = []; // Filtered user list based on the @mention
  selectedUsers: string[] = [];

  private canvas: HTMLCanvasElement = document.createElement("canvas");

  constructor(private sanitizer: DomSanitizer, private renderer: Renderer2) {}

  // Method to detect @mention in the comment input
  detectMention(event: KeyboardEvent): void {
    const inputElement: HTMLInputElement = event.target as HTMLInputElement;
    const cursorPosition: number | null = inputElement.selectionStart;

    if (!cursorPosition) { // Early exit if we can't determine cursor position
      this.showMentionList = false;
      this.selectedUserIndex = 0;
      return;
    }

    // Get last word BEFORE cursor but AFTER space or newline
    const fullTextBeforeCursor: string = inputElement.value.substring(0, cursorPosition);
    const lineBeforeCursor: string | undefined = fullTextBeforeCursor.split('\n').pop();
    const lastWord: string | undefined = lineBeforeCursor?.split(/[\s\n]+/).pop();

    if (lastWord?.startsWith('@')) {
      if (!this.updateFilteredUsers(lastWord)) {
        return;
      }
      this.updateMentionListPosition(lineBeforeCursor, inputElement);
    } else {
      this.hideMentionList();
    }
  }

  // Method to handle key events
  handleKeydown(event: KeyboardEvent): void {
    if (this.showMentionList && this.mentionList) {
      const list = this.mentionList.nativeElement;
      const items = list.getElementsByTagName('li');
      if (!items.length) return;

      // Enter key
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent moving to next line in text box
        this.selectUser(this.filteredUsers[this.selectedUserIndex].name);
      }

      // Arrow down
      if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent keying down in text box
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
        event.preventDefault(); // Prevent keying up in text box
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
  selectUser(userName: string): void {
    // Replace partially finished '@' string with full username
    this.newCommentText = this.newCommentText.replace(/@(\w+)?$/, `@${userName} `);
    if (!this.selectedUsers.includes(userName)) {
      this.selectedUsers.push(userName);
    }
    this.showMentionList = false;
    this.selectedUserIndex = 0;
  }

  // Method to add the comment to the comments array
  addComment(): void {
    if (this.newCommentText) {
      let parsedText: string = this.newCommentText;
      this.selectedUsers.forEach(userName => {
        const regex = new RegExp(`@${userName}`, 'g');
        parsedText = parsedText.replace(regex, `<strong>@${userName}</strong>`);
      });

      this.comments.push({
        text: this.newCommentText,
        parsedText,
        timestamp: new Date().toString()
      });

      // Alert each mentioned user
      this.selectedUsers.forEach(userName => {
        alert(`Mentioned: ${userName}`); // Or send email/push notification
      });

      this.newCommentText = '';
      this.selectedUsers = []
      this.showMentionList = false;
    }
  }

  // Method to clean parsedText
  getSanitizedHtml(content: string | undefined): SafeHtml {
    if (content) {
      return this.sanitizer.bypassSecurityTrustHtml(content)
    } else {
      return '';
    }
  }

  updateFilteredUsers(word: string): boolean {
    const oldFilteredUsersLength: number = this.filteredUsers.length;

    this.filteredUsers = this.users
      .filter(user => user.name.toLowerCase().startsWith(word.substr(1).toLowerCase()))
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    if (this.filteredUsers.length !== oldFilteredUsersLength) {
      this.selectedUserIndex = 0;
    }

    if (!this.filteredUsers.length) {
      this.hideMentionList();
      return false;
    }
    return true;
  }

  // Helper for #detectMention
  private updateMentionListPosition(line: string | undefined, input: HTMLInputElement): void {
    const horizontalPosition: number = this.getTextWidth(line, getComputedStyle(input).font);

    if (this.mentionList && this.mentionList.nativeElement) {
      this.renderer.setStyle(this.mentionList.nativeElement, 'left', `${horizontalPosition}px`);
      this.renderer.setStyle(this.mentionList.nativeElement, 'opacity', '1');
      this.renderer.setStyle(this.mentionList.nativeElement, 'visibility', 'visible');
    }

    this.showMentionList = true;
  }

  private hideMentionList(): void {
    this.showMentionList = false;
    this.selectedUserIndex = 0;
  }

  // Helper for #updateMentionListPosition
  private getTextWidth(text: string | undefined, font: string): number {
    const context: CanvasRenderingContext2D | null = this.canvas.getContext("2d");
    if (context && text) {
      context.font = font;
      return context.measureText(text).width;
    }
    return 0;
  }

}
