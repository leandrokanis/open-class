import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ProfileService } from './profile.service';

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Leandro Alves',
  email: 'leandro@test.com',
  role: 'aluno',
  bio: 'Dev apaixonado',
  avatarUrl: null,
  passwordHash: 'hashed-pw',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  ...overrides,
});

const makeUploadService = (overrides = {}) => ({
  avatarUrl: vi.fn().mockImplementation((filename: string) => `http://localhost:3001/uploads/avatars/${filename}`),
  deleteByUrl: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeRepo = (overrides = {}) => ({
  findById: vi.fn().mockResolvedValue(makeUser()),
  updateProfile: vi.fn(),
  updateAvatarUrl: vi.fn().mockResolvedValue(makeUser()),
  ...overrides,
});

const buildService = (repoOverrides = {}, uploadOverrides = {}) => {
  const repo = makeRepo(repoOverrides);
  const upload = makeUploadService(uploadOverrides);
  const service = new ProfileService(repo as never, upload as never);
  return { service, repo, upload };
};

describe('ProfileService', () => {
  describe('getProfile()', () => {
    it('should return profile without passwordHash', async () => {
      const { service } = buildService();

      const result = await service.getProfile('user-1');

      expect(result).toMatchObject({
        id: 'user-1',
        name: 'Leandro Alves',
        email: 'leandro@test.com',
        role: 'aluno',
        bio: 'Dev apaixonado',
        avatarUrl: null,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return hasPassword=true when user has a local password', async () => {
      const { service } = buildService({
        findById: vi.fn().mockResolvedValue(makeUser({ passwordHash: 'bcrypt-hash' })),
      });

      const result = await service.getProfile('user-1');

      expect(result.hasPassword).toBe(true);
    });

    it('should return hasPassword=false for Google-only account (no passwordHash)', async () => {
      const { service } = buildService({
        findById: vi.fn().mockResolvedValue(makeUser({ passwordHash: null })),
      });

      const result = await service.getProfile('user-1');

      expect(result.hasPassword).toBe(false);
    });
  });

  describe('updateProfile()', () => {
    it('should persist name and bio and return updated profile', async () => {
      const updated = makeUser({ name: 'Novo Nome', bio: 'Bio nova' });
      const { service, repo } = buildService({
        updateProfile: vi.fn().mockResolvedValue(updated),
        findById: vi.fn().mockResolvedValue(updated),
      });

      const result = await service.updateProfile('user-1', { name: 'Novo Nome', bio: 'Bio nova' });

      expect(repo.updateProfile).toHaveBeenCalledWith('user-1', { name: 'Novo Nome', bio: 'Bio nova' });
      expect(result.name).toBe('Novo Nome');
      expect(result.bio).toBe('Bio nova');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('setAvatar()', () => {
    const mockFile = { filename: 'new-avatar.jpg' } as Express.Multer.File;

    it('should delete previous avatar and save new URL', async () => {
      const userWithAvatar = makeUser({ avatarUrl: 'http://localhost:3001/uploads/avatars/old.jpg' });
      const updatedUser = makeUser({ avatarUrl: 'http://localhost:3001/uploads/avatars/new-avatar.jpg' });
      const { service, repo, upload } = buildService(
        {
          findById: vi.fn().mockResolvedValue(userWithAvatar),
          updateAvatarUrl: vi.fn().mockResolvedValue(updatedUser),
        },
      );

      const result = await service.setAvatar('user-1', mockFile);

      expect(upload.deleteByUrl).toHaveBeenCalledWith(userWithAvatar.avatarUrl);
      expect(repo.updateAvatarUrl).toHaveBeenCalledWith('user-1', 'http://localhost:3001/uploads/avatars/new-avatar.jpg');
      expect(result.avatarUrl).toBe('http://localhost:3001/uploads/avatars/new-avatar.jpg');
    });

    it('should not attempt deletion when user has no previous avatar', async () => {
      const userNoAvatar = makeUser({ avatarUrl: null });
      const updatedUser = makeUser({ avatarUrl: 'http://localhost:3001/uploads/avatars/new-avatar.jpg' });
      const { service, repo, upload } = buildService({
        findById: vi.fn().mockResolvedValue(userNoAvatar),
        updateAvatarUrl: vi.fn().mockResolvedValue(updatedUser),
      });

      await service.setAvatar('user-1', mockFile);

      expect(upload.deleteByUrl).not.toHaveBeenCalled();
      expect(repo.updateAvatarUrl).toHaveBeenCalledWith('user-1', expect.stringContaining('new-avatar.jpg'));
    });

    it('should throw BadRequestException when no file is provided', async () => {
      const { service } = buildService();

      await expect(service.setAvatar('user-1', undefined as never)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeAvatar()', () => {
    it('should delete file and set avatarUrl to null', async () => {
      const userWithAvatar = makeUser({ avatarUrl: 'http://localhost:3001/uploads/avatars/old.jpg' });
      const updatedUser = makeUser({ avatarUrl: null });
      const { service, repo, upload } = buildService({
        findById: vi.fn().mockResolvedValue(userWithAvatar),
        updateAvatarUrl: vi.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.removeAvatar('user-1');

      expect(upload.deleteByUrl).toHaveBeenCalledWith(userWithAvatar.avatarUrl);
      expect(repo.updateAvatarUrl).toHaveBeenCalledWith('user-1', null);
      expect(result.avatarUrl).toBeNull();
    });

    it('should be idempotent when user has no avatar', async () => {
      const userNoAvatar = makeUser({ avatarUrl: null });
      const { service, repo, upload } = buildService({
        findById: vi.fn().mockResolvedValue(userNoAvatar),
        updateAvatarUrl: vi.fn().mockResolvedValue(userNoAvatar),
      });

      await service.removeAvatar('user-1');

      expect(upload.deleteByUrl).not.toHaveBeenCalled();
      expect(repo.updateAvatarUrl).toHaveBeenCalledWith('user-1', null);
    });
  });
});
