import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaireDetailComponent } from './formulaire-detail.component';

describe('FormulaireDetailComponent', () => {
  let component: FormulaireDetailComponent;
  let fixture: ComponentFixture<FormulaireDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaireDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
