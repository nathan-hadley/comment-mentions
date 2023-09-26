import {
  ViewChild,
  ElementRef,
  Component,
  Renderer2,
  Input,
  SecurityContext,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { User } from '../app.component';

interface Comment {
  text: string;
  parsedText?: string;
  timestamp: string;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  @Input() users: User[] = [];
  @ViewChild('mentionList') mentionList: ElementRef | undefined;

  comments: Comment[] = [];
  selectedUserIndex: number = 0;
  newCommentText: string = '';
  showMentionList: boolean = false;
  filteredUsers: User[] = []; // Filtered user list based on the @mention

  private canvas: HTMLCanvasElement = document.createElement('canvas');

  constructor(
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
  ) {}

  // Method to detect @user in the comment input
  detectMention(event: KeyboardEvent): void {
    if (!event.target) return;
    const inputElement: HTMLInputElement = event.target as HTMLInputElement;
    const cursorPosition: number | null = inputElement.selectionStart;

    if (!cursorPosition) {
      // Early exit if we can't determine cursor position
      this.showMentionList = false;
      this.selectedUserIndex = 0;
      return;
    }

    // Get last word BEFORE cursor but AFTER space or newline
    const fullTextBeforeCursor: string = inputElement.value.substring(
      0,
      cursorPosition,
    );
    const lineBeforeCursor: string | undefined = fullTextBeforeCursor
      .split('\n')
      .pop();
    const lastWord: string | undefined = lineBeforeCursor
      ?.split(/[\s\n]+/)
      .pop();

    if (lastWord?.startsWith('@')) {
      if (!this.updateFilteredUsers(lastWord)) {
        return;
      }
      this.updateMentionListPosition(lineBeforeCursor, inputElement);
    } else {
      this.hideMentionList();
    }
  }

  // #detectMention helper
  private updateFilteredUsers(word: string): boolean {
    const oldFilteredUsersLength: number = this.filteredUsers.length;

    this.filteredUsers = this.users
      .filter((user) =>
        user.name.toLowerCase().startsWith(word.substring(1).toLowerCase()),
      )
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

  // #detectMention helper
  private hideMentionList(): void {
    this.showMentionList = false;
    this.selectedUserIndex = 0;
  }

  // #detectMention helper
  private updateMentionListPosition(
    line: string | undefined,
    input: HTMLInputElement,
  ): void {
    const horizontalPosition: number = this.getTextWidth(
      line,
      getComputedStyle(input).font,
    );

    if (this.mentionList && this.mentionList.nativeElement) {
      this.renderer.setStyle(
        this.mentionList.nativeElement,
        'left',
        `${horizontalPosition}px`,
      );
      this.renderer.setStyle(this.mentionList.nativeElement, 'opacity', '1');
      this.renderer.setStyle(
        this.mentionList.nativeElement,
        'visibility',
        'visible',
      );
    }

    this.showMentionList = true;
  }

  // #updateMentionListPosition helper
  private getTextWidth(text: string | undefined, font: string): number {
    const context: CanvasRenderingContext2D | null =
      this.canvas.getContext('2d');
    if (context && text) {
      context.font = font;
      return context.measureText(text).width;
    }
    return 0;
  }

  // Method to handle key events
  handleKeydown(event: KeyboardEvent): void {
    if (!this.showMentionList || !this.mentionList) return;

    const list = this.mentionList.nativeElement;
    const items = list.getElementsByTagName('li');
    if (!items.length) return;

    switch (event.key) {
      case 'Enter':
        this.handleEnter(event);
        break;
      case 'ArrowDown':
        this.handleArrowDown(event, items, list);
        break;
      case 'ArrowUp':
        this.handleArrowUp(event, items, list);
        break;
    }
  }

  // #handleKeydown helper
  private handleEnter(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent moving to next line in text box
    this.selectUser(this.filteredUsers[this.selectedUserIndex].name);
  }

  // #handleKeydown helper
  private handleArrowDown(
    event: KeyboardEvent,
    items: HTMLCollection,
    list: Element,
  ): void {
    event.preventDefault();
    this.selectedUserIndex =
      this.selectedUserIndex < this.filteredUsers.length - 1
        ? this.selectedUserIndex + 1
        : 0;

    // Scroll adjustment
    list.scrollTop =
      this.selectedUserIndex === 0
        ? 0
        : this.adjustScroll(items[this.selectedUserIndex], list, true);
  }

  // #handleKeydown helper
  private handleArrowUp(
    event: KeyboardEvent,
    items: HTMLCollection,
    list: Element,
  ): void {
    event.preventDefault();
    this.selectedUserIndex =
      this.selectedUserIndex > 0
        ? this.selectedUserIndex - 1
        : this.filteredUsers.length - 1;

    // Scroll adjustment
    list.scrollTop =
      this.selectedUserIndex === this.filteredUsers.length - 1
        ? list.scrollHeight
        : this.adjustScroll(items[this.selectedUserIndex], list, false);
  }

  // #handleKeydown helper
  private adjustScroll(
    item: Element,
    list: Element,
    isArrowDown: boolean,
  ): number {
    const castItem: HTMLElement = item as HTMLElement;
    if (
      isArrowDown &&
      castItem.offsetTop + castItem.clientHeight >
        list.scrollTop + list.clientHeight
    ) {
      return castItem.offsetTop + castItem.clientHeight - list.clientHeight;
    }
    if (!isArrowDown && castItem.offsetTop < list.scrollTop) {
      return castItem.offsetTop;
    }
    return list.scrollTop;
  }

  // Method to select a user from the mention list
  selectUser(userName: string): void {
    // Replace partially finished '@' string with full username
    this.newCommentText = this.newCommentText.replace(
      /@(\w+)?$/,
      `@${userName} `,
    );
    this.showMentionList = false;
    this.selectedUserIndex = 0;
  }

  // Method to submit the new comment
  addComment(): void {
    if (this.newCommentText) {
      // Convert newlines in textarea to <br> for display in HTML
      const textWithBreaks = this.newCommentText.replace(/\n/g, '<br>');
      // Sanitize comment string so we can safely inject html with bolded mentions
      let parsedText =
        this.sanitizer.sanitize(SecurityContext.HTML, textWithBreaks) || '';

      const mentions = this.collectMentions(this.newCommentText);
      mentions.forEach((userName) => {
        const regex = new RegExp(`@${userName}`, 'g');
        parsedText = parsedText.replace(regex, `<strong>@${userName}</strong>`);
      });

      this.comments.push({
        text: this.newCommentText,
        parsedText,
        timestamp: new Date().toString(),
      });

      // Alert each mentioned user
      mentions.forEach((userName) => {
        alert(`Mentioned: ${userName}`); // Or send email/push notification
      });

      this.newCommentText = '';
      this.showMentionList = false;
    }
  }

  private collectMentions(inputString: string): string[] {
    // Extract potential usernames from the input string
    const potentialMentions = (inputString.match(/@\w+/g) || []).map((name) =>
      name.substring(1),
    );
    // Filter out names that don't exist in this.users
    const mentions = potentialMentions.filter((name) =>
      this.users.some((user) => user.name.toLowerCase() === name.toLowerCase()),
    );
    return mentions;
  }
}
