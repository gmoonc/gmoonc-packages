import { fetchGravatarAvatarByEmail, getGravatarHash } from '../gravatar';

describe('gravatar lib', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.GRAVATAR_API_BASE_URL = 'https://gravatar.test/';
    process.env.GRAVATAR_API_KEY = 'secret';
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('normalizes email before hashing', () => {
    expect(getGravatarHash(' Test@Example.com ')).toBe(
      '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b'
    );
  });

  it('returns null when email is missing', async () => {
    const result = await fetchGravatarAvatarByEmail('');
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns avatar url when the profile exists', async () => {
    const avatarUrl = 'https://images.test/avatar.png';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ avatar_url: avatarUrl }),
    });

    const result = await fetchGravatarAvatarByEmail('user@example.com');

    expect(result).toBe(avatarUrl);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://gravatar.test/profiles/b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer secret',
          Accept: 'application/json',
        }),
      })
    );
  });

  it('returns null on 404 responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: jest.fn(),
    });

    await expect(fetchGravatarAvatarByEmail('user@example.com')).resolves.toBeNull();
  });

  it('logs and returns null on unexpected errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: jest.fn(),
    });

    await expect(fetchGravatarAvatarByEmail('user@example.com')).resolves.toBeNull();
  });
});
