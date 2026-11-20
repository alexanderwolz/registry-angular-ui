import { Clipboard } from '@angular/cdk/clipboard';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CopyTextComponent } from './copy-text.component';

describe('CopyTextComponent', () => {
  const copy = vi.fn();

  function create(text?: string) {
    TestBed.configureTestingModule({
      declarations: [CopyTextComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: Clipboard, useValue: { copy } }],
    });
    const fixture = TestBed.createComponent(CopyTextComponent);
    if (text !== undefined) fixture.componentInstance.text = text;
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => copy.mockClear());

  it('should show the text', () => {
    expect((create('docker pull x').nativeElement as HTMLElement).textContent).toContain(
      'docker pull x',
    );
  });

  it('should copy the text when the icon is clicked', () => {
    const fixture = create('docker pull x');
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('i.fa-copy')!.click();
    expect(copy).toHaveBeenCalledWith('docker pull x');
  });
});
