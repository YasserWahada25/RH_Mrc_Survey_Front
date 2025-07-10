import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizDisqueComponent } from './quiz-disque.component';

describe('QuizDisqueComponent', () => {
  let component: QuizDisqueComponent;
  let fixture: ComponentFixture<QuizDisqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizDisqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizDisqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
