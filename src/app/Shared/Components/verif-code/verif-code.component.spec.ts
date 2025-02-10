import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifCodeComponent } from './verif-code.component';

describe('VerifCodeComponent', () => {
  let component: VerifCodeComponent;
  let fixture: ComponentFixture<VerifCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
