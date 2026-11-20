import { Layer } from './layer';

describe('Layer', () => {
  it('should strip the shell prefix of nop instructions', () => {
    const layer = new Layer('/bin/sh -c #(nop) ADD file:abc in / ', 0);
    expect(layer.command).toBe('ADD');
    expect(layer.instruction).toBe('file:abc in /');
  });

  it('should normalize RUN instructions', () => {
    expect(new Layer('/bin/sh -c apk add curl', 0).command).toBe('RUN');
    expect(new Layer('/bin/sh -c apk add curl', 0).instruction).toBe('apk add curl');
    expect(new Layer('RUN /bin/sh -c make', 0).instruction).toBe('make');
  });

  it('should format sizes with the matching unit', () => {
    expect(new Layer('RUN a', 512).getCompressedSizeString()).toBe('512.00 B');
    expect(new Layer('RUN a', 2048).getCompressedSizeString()).toBe('2.00 KB');
    expect(new Layer('RUN a', 5 * Layer.MB).getCompressedSizeString()).toBe('5.00 MB');
    expect(new Layer('RUN a', 3 * Layer.GB).getCompressedSizeString()).toBe('3.00 GB');
  });

  it('should crop long instructions only when they reach the threshold', () => {
    const layer = new Layer('RUN 0123456789', 0);
    expect(layer.getInstructionCropped(50)).toBe('0123456789');
    expect(layer.getInstructionCropped(4)).toBe('0123 ... ');
  });
});
