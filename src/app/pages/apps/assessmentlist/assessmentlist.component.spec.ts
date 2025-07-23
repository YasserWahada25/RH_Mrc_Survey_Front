import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentlistComponent } from './assessmentlist.component';

describe('AssessmentlistComponent', () => {
  let component: AssessmentlistComponent;
  let fixture: ComponentFixture<AssessmentlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
