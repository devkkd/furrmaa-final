import { navigateRoot, safeGoBack } from '../src/utils/navigateRoot';

describe('navigateRoot', () => {
  it('prefers parent navigator when available', () => {
    const parentNavigate = jest.fn();
    const childNavigate = jest.fn();
    const navigation = {
      getParent: () => ({ navigate: parentNavigate }),
      navigate: childNavigate,
    };
    navigateRoot(navigation, 'HopeDetail', { pet: { id: '1' } });
    expect(parentNavigate).toHaveBeenCalledWith('HopeDetail', { pet: { id: '1' } });
    expect(childNavigate).not.toHaveBeenCalled();
  });

  it('falls back to child navigate', () => {
    const childNavigate = jest.fn();
    navigateRoot({ navigate: childNavigate }, 'Cart');
    expect(childNavigate).toHaveBeenCalledWith('Cart', undefined);
  });
});

describe('safeGoBack', () => {
  it('skips goBack when canGoBack is false', () => {
    const goBack = jest.fn();
    safeGoBack({ canGoBack: () => false, goBack });
    expect(goBack).not.toHaveBeenCalled();
  });

  it('calls goBack when history exists', () => {
    const goBack = jest.fn();
    safeGoBack({ canGoBack: () => true, goBack });
    expect(goBack).toHaveBeenCalled();
  });
});
