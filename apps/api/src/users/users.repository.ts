import { Inject, Injectable } from '@nestjs/common';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { users, passwordResetTokens, type NewUser } from '@open-class/db';
import type { Role } from '../common';
import type { Db } from '../db';

@Injectable()
export class UsersRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  findByEmail(email: string) {
    return this.db.query.users.findFirst({ where: eq(users.email, email) });
  }

  findById(id: string) {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
  }

  findByGoogleId(googleId: string) {
    return this.db.query.users.findFirst({ where: eq(users.googleId, googleId) });
  }

  async create(data: NewUser) {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    const [user] = await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async linkGoogleId(id: string, googleId: string, avatarUrl?: string) {
    const [user] = await this.db
      .update(users)
      .set({ googleId, avatarUrl: avatarUrl ?? undefined, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    const [token] = await this.db
      .insert(passwordResetTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return token;
  }

  findValidPasswordResetToken(tokenHash: string) {
    const now = new Date();
    return this.db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    });
  }

  findAll() {
    return this.db.query.users.findMany({
      columns: { passwordHash: false },
    });
  }

  async updateRole(id: string, role: Role) {
    const [user] = await this.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async markPasswordResetTokenUsed(id: string) {
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }
}
