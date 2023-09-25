import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      imports: [ FormsModule ]
    });
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.users = [
      // Mocked users data here
      {'userID' : 1, 'name' : 'Kevin'},
      {'userID' : 2, 'name' : 'Jeff'},
      {'userID' : 3, 'name' : 'Bryan'},
      {'userID' : 4, 'name' : 'Gabbey'},
      {'userID' : 5, 'name' : 'Nathan'},
      {'userID' : 6, 'name' : 'Kyle'},
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#addComment', () => {
    it('should add a comment when addComment is called', () => {
      component.newCommentText = 'Hello, this is a comment';
      component.addComment();
      expect(component.comments.length).toEqual(1);
      expect(component.comments[0].text).toEqual('Hello, this is a comment');
    });

    it('should bold existing users mentioned in the comment text', () => {
      component.newCommentText = `Hello @K`;
      component.selectUser('Kevin')
      component.addComment();
      const addedComment = component.comments[component.comments.length - 1];
      expect(addedComment.parsedText).toContain(`<strong>@Kevin</strong>`);
    });

    it('should alert mentioned users when comment with mentions is added', () => {
      const alertSpy = spyOn(window, 'alert');
      component.newCommentText = 'Hello @Kevin and @Jeff';
      component.selectUser('Kevin')
      component.selectUser('Jeff')
      component.addComment();
      expect(alertSpy.calls.count()).toEqual(2);
      expect(alertSpy.calls.argsFor(0)).toEqual(['Mentioned: Kevin']);
      expect(alertSpy.calls.argsFor(1)).toEqual(['Mentioned: Jeff']);
    });

    it('should not alert non-mentioned users', () => {
      const alertSpy = spyOn(window, 'alert');
      component.newCommentText = 'Hello @nonexistent-user';
      component.addComment();
      expect(alertSpy.calls.count()).toEqual(0);
    });
  })

  describe('#detectMentions', () => {
    beforeEach(() => {
      // @ts-ignore
      spyOn(window, 'getComputedStyle').and.callFake((elem: any) => {
        return {
          getPropertyValue: (prop) => {
            if (prop === 'font') {
              return '16px Serif';  // Mocked font value
            }
            return '';  // Default for other properties
          }
        };
      });
    })

    it('should populate filteredUsers and show mention list when "@" is detected', () => {
      const inputEvent = {target: {value: '@K', selectionStart: 2}};
      component.detectMention(inputEvent as any);
      expect(component.filteredUsers.length).toBeGreaterThan(0);
      expect(component.showMentionList).toBeTrue();
    });

    it('should populate filteredUsers and show mention list when "@" is detected after newline', () => {
      const inputEvent = {target: {value: 'Hi!\n@K', selectionStart: 7}};
      component.detectMention(inputEvent as any);
      expect(component.filteredUsers.length).toBeGreaterThan(0);
      expect(component.showMentionList).toBeTrue();
    });

    it('should hide mention list when no "@" is detected', () => {
      const inputEvent = {target: {value: 'Hi', selectionStart: 2}};
      component.detectMention(inputEvent as any);
      expect(component.showMentionList).toBeFalse();
    });

    it('should hide mention list when no "@" is detected on first character of textbox', () => {
      let inputEvent = {target: {value: '@', selectionStart: 1}};
      component.detectMention(inputEvent as any);
      expect(component.showMentionList).toBeTruthy();

      inputEvent = {target: {value: '', selectionStart: 0}};
      component.detectMention(inputEvent as any);
      expect(component.showMentionList).toBeFalse();
    });

    it('should hide mention list when no "@" is detected before cursor', () => {
      const inputEvent = {target: {value: 'Hi @K', selectionStart: 2}};
      component.detectMention(inputEvent as any);
      expect(component.showMentionList).toBeFalse();
    });

    it('should update filteredUsers when new character after "@" matches user names', () => {
      const inputEvent = { target: { value: '@Ke', selectionStart: 3 } };
      component.detectMention(inputEvent as any);
      const kevinExists = component.filteredUsers.some(user => user.name === 'Kevin');
      expect(kevinExists).toBeTrue();
    });

    it('should reset the selected index when filtered users list changes', () => {
      component.selectedUserIndex = 3;
      const inputEvent = { target: { value: '@Je', selectionStart: 3 } };
      component.detectMention(inputEvent as any);
      expect(component.selectedUserIndex).toEqual(0);
    });
  })

  describe('Arrow key navigation', () => {
    beforeEach(() => {
      component.filteredUsers = component.users; // Assuming all users are shown
      component.showMentionList = true;
      component.mentionList = fixture.debugElement.nativeElement.querySelector('#mentionList');
    })

    it('should select the next user on ArrowDown key', () => {
      component.selectedUserIndex = 0; // Start from first user
      fixture.detectChanges(); // Trigger change detection to ensure template processes the data
      // @ts-ignore
      component.handleKeydown({ key: 'ArrowDown', preventDefault: jasmine.createSpy('preventDefault') } as KeyboardEvent);
      fixture.detectChanges(); // Trigger change detection to get updated state after event
      expect(component.selectedUserIndex).toEqual(1);
    });

    it('should select the first user after the last user on ArrowDown key', () => {
      component.selectedUserIndex = component.users.length - 1; // Start from the last user
      fixture.detectChanges();
      // @ts-ignore
      component.handleKeydown({ key: 'ArrowDown', preventDefault: jasmine.createSpy('preventDefault') } as KeyboardEvent);
      fixture.detectChanges();
      expect(component.selectedUserIndex).toEqual(0);
    });

    it('should select the previous user on ArrowUp key', () => {
      component.selectedUserIndex = 1; // Start from the second user
      fixture.detectChanges();
      // @ts-ignore
      component.handleKeydown({ key: 'ArrowUp', preventDefault: jasmine.createSpy('preventDefault') } as KeyboardEvent);
      fixture.detectChanges();
      expect(component.selectedUserIndex).toEqual(0);
    });

    it('should select the last user before the first user on ArrowUp key', () => {
      component.selectedUserIndex = 0; // Start from the first user
      fixture.detectChanges();
      // @ts-ignore
      component.handleKeydown({ key: 'ArrowUp', preventDefault: jasmine.createSpy('preventDefault') } as KeyboardEvent);
      fixture.detectChanges();
      expect(component.selectedUserIndex).toEqual(component.users.length - 1);
    });
  })

  describe('#selectUser', () => {
    it('should update newCommentText when user is selected from mention list', () => {
      component.newCommentText = 'Hello @Ke';
      component.selectUser('Kevin');
      expect(component.newCommentText).toEqual('Hello @Kevin ');
    });

    it('should hide mention list after user is selected', () => {
      component.newCommentText = 'Hello @Ke';
      component.showMentionList = true;
      component.selectUser('Kevin');
      expect(component.showMentionList).toBeFalse();
    });
  })

});
