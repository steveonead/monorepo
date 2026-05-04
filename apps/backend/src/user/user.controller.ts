import type { User } from '@superdsp/api-schemas/auth/user';

import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserSchema } from '@superdsp/api-schemas/auth/user';
import { createZodDto } from 'nestjs-zod';
import { randomUUID } from 'node:crypto';

class CreateUserDto extends createZodDto(CreateUserSchema) {}

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
      createdAt: new Date(),
    };
    users.push(user);
    return user;
  }
}
