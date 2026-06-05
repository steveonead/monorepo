import type { User } from '@superdsp/api-schemas/auth/user';

import { Injectable } from '@nestjs/common';
import { CreateUserInputSchema } from '@superdsp/api-schemas/auth/user';
import { randomUUID } from 'node:crypto';
import { z } from 'zod/v4';

type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

@Injectable()
export class UserService {
  private readonly users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  create(input: CreateUserInput): User {
    const user: User = {
      id: randomUUID(),
      ...input,
      role: 'user',
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }
}
