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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a comment when addComment is called', () => {
    component.newCommentText = 'Hello, this is a comment';
    component.addComment();
    expect(component.comments.length).toEqual(1);
    expect(component.comments[0].text).toEqual('Hello, this is a comment');
  });

  it('should populate filteredUsers and show mention list when "@" is detected', () => {
    const inputEvent = { target: { value: '@K' } };
    component.detectMention(inputEvent as any);
    expect(component.filteredUsers.length).toBeGreaterThan(0);
    expect(component.showMentionList).toBeTrue();
  });

  it('should hide mention list when no "@" is detected', () => {
    const inputEvent = {
      target: {
        value: 'Hello'
      }
    };
    component.detectMention(inputEvent as any);
    expect(component.showMentionList).toBeFalse();
  });

  it('should update newCommentText when user is selected from mention list', () => {
    component.newCommentText = 'Hello @Ke';
    component.selectUser('Kevin');
    expect(component.newCommentText).toEqual('Hello @Kevin');
  });

  it('should hide mention list after user is selected', () => {
    component.newCommentText = 'Hello @Ke';
    component.showMentionList = true;
    component.selectUser('Kevin');
    expect(component.showMentionList).toBeFalse();
  });

  it('should alert mentioned users when comment with mentions is added', () => {
    const alertSpy = spyOn(window, 'alert');
    component.newCommentText = 'Hello @Kevin and @Jeff';
    component.addComment();
    expect(alertSpy.calls.count()).toEqual(2);
    expect(alertSpy.calls.argsFor(0)).toEqual(['Mentioned: Kevin']);
    expect(alertSpy.calls.argsFor(1)).toEqual(['Mentioned: Jeff']);
  });

  it('should not alert non-mentioned users', () => {
    const alertSpy = spyOn(window, 'alert');
    component.newCommentText = 'Hello @Kevin';
    component.addComment();
    expect(alertSpy.calls.count()).toEqual(1);
    expect(alertSpy).toHaveBeenCalledWith('Mentioned: Kevin');
  });
});
