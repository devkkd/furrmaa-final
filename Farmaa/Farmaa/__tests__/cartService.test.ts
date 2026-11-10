jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { mapCartToLines, linesToCheckoutItems } from '../src/services/cartService';

describe('mapCartToLines', () => {
  it('returns empty array for null/empty cart', () => {
    expect(mapCartToLines(null)).toEqual([]);
    expect(mapCartToLines({})).toEqual([]);
    expect(mapCartToLines({ items: [] })).toEqual([]);
  });

  it('maps valid cart items and skips broken products', () => {
    const lines = mapCartToLines({
      items: [
        {
          quantity: 2,
          product: {
            _id: 'p1',
            name: 'Dog Food',
            price: 500,
            discountPrice: 400,
            images: ['https://example.com/a.png'],
          },
        },
        { quantity: 1, product: null },
        { quantity: 1, product: { name: 'No id' } },
      ],
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      productId: 'p1',
      name: 'Dog Food',
      quantity: 2,
      price: 500,
      discountPrice: 400,
    });
  });
});

describe('linesToCheckoutItems', () => {
  it('maps lines for checkout payload', () => {
    const items = linesToCheckoutItems([
      {
        productId: 'p1',
        name: 'Treat',
        price: 100,
        discountPrice: 80,
        quantity: 3,
      },
    ]);
    expect(items[0]).toMatchObject({
      _id: 'p1',
      name: 'Treat',
      quantity: 3,
      price: 80,
    });
  });
});
