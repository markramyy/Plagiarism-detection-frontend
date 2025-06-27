import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccuracyRingComponent } from './accuracy-ring.component';

describe('AccuracyRingComponent', () => {
  let component: AccuracyRingComponent;
  let fixture: ComponentFixture<AccuracyRingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccuracyRingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccuracyRingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
