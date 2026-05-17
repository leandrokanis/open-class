import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

const makeRepo = (overrides = {}) => ({
  findByEmail: vi.fn().mockResolvedValue(null),
  findById: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue([]),
  updateRole: vi.fn().mockImplementation((id, role) => Promise.resolve({ id, role })),
  setActiveStatus: vi.fn().mockImplementation((id, isActive) =>
    Promise.resolve({ id, isActive }),
  ),
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new UsersService(repo as never);
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      repo.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      const result = await service.findByEmail('a@b.com');
      expect(result?.id).toBe('u1');
    });

    it('returns null when not found', async () => {
      expect(await service.findByEmail('x@x.com')).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      repo.findById.mockResolvedValue({ id: 'u1' });
      expect((await service.findById('u1'))?.id).toBe('u1');
    });

    it('returns null when not found', async () => {
      expect(await service.findById('missing')).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      repo.findAll.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('updateUserRole', () => {
    it('updates role for existing user', async () => {
      repo.findById.mockResolvedValue({ id: 'u1', role: 'aluno' });
      const result = await service.updateUserRole('u1', 'instrutor' as never);
      expect(repo.updateRole).toHaveBeenCalledWith('u1', 'instrutor');
      expect(result.role).toBe('instrutor');
    });

    it('throws NotFoundException for unknown user', async () => {
      await expect(service.updateUserRole('missing', 'admin' as never)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setActiveStatus', () => {
    it('deactivates another user', async () => {
      repo.findById.mockResolvedValue({ id: 'u2' });
      const result = await service.setActiveStatus('u2', 'admin-1', false);
      expect(repo.setActiveStatus).toHaveBeenCalledWith('u2', false);
      expect(result.isActive).toBe(false);
    });

    it('throws BadRequestException when user tries to modify own account', async () => {
      await expect(service.setActiveStatus('u1', 'u1', false)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException for unknown user', async () => {
      await expect(service.setActiveStatus('missing', 'admin-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
