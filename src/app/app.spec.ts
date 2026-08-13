import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('creates the viewer', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('introduces private local report processing', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('See what stands between');
    expect(content).toContain('Local processing only');
  });
});

