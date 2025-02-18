import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifMailComponent } from './verif-mail.component';

describe('VerifMailComponent', () => {
  let component: VerifMailComponent;
  let fixture: ComponentFixture<VerifMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifMailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
