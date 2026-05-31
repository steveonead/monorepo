import type { User } from '@superdsp/api-schemas/auth/user';

import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserInputSchema } from '@superdsp/api-schemas/auth/user';
import { createZodDto } from 'nestjs-zod';
import { randomUUID } from 'node:crypto';

class CreateUserDto extends createZodDto(CreateUserInputSchema) {}

const users: User[] = [];

@Controller('users')
export class UserController {
  @Get()
  findAll(): User[] {
    return users;
  }

  @Post()
  create(@Body() dto: CreateUserDto): User {
    const user: User = {
      id: randomUUID(),
      ...dto,
      // role 由 server 指派，不接受呼叫端輸入，避免特權提升
      role: 'user',
      createdAt: new Date(),
    };
    users.push(user);
    return user;
  }
}
