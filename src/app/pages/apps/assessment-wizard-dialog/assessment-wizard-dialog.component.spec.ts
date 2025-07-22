import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentWizardDialogComponent } from './assessment-wizard-dialog.component';

describe('AssessmentWizardDialogComponent', () => {
  let component: AssessmentWizardDialogComponent;
  let fixture: ComponentFixture<AssessmentWizardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentWizardDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
