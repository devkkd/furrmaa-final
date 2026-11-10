import { BANNER_ASPECT, getHomeBanners } from '../src/data/homeBanners';

describe('homeBanners', () => {
  it('keeps website 2560×900 aspect', () => {
    expect(BANNER_ASPECT).toBeCloseTo(2560 / 900, 5);
  });

  it('returns dog and cat slides with images', () => {
    const dog = getHomeBanners('dog');
    const cat = getHomeBanners('cat');
    expect(dog.length).toBeGreaterThan(1);
    expect(cat.length).toBeGreaterThan(1);
    dog.forEach((b) => {
      expect(b.id).toBeTruthy();
      expect(b.image).toBeTruthy();
    });
  });
});
