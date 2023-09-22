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

  it('should populate filteredUsers and show mention list when "@" is detected', () => {
    const inputEvent = {
      target: {
        value: '@K'
      }
    };
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
});
