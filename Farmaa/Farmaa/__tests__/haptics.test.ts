import { hapticLight, hapticMedium, hapticSuccess } from '../src/utils/haptics';

describe('haptics', () => {
  it('never throws (Vibration disabled to prevent Android process crash)', () => {
    expect(() => hapticLight()).not.toThrow();
    expect(() => hapticMedium()).not.toThrow();
    expect(() => hapticSuccess()).not.toThrow();
  });
});
