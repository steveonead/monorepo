import type { User } from '@superdsp/api-schemas/auth/user';

import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CreateUserDto, UserDto, UserListDto } from '@/user/dto/user.dto';
import { UserService } from '@/user/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodResponse({ type: UserListDto })
  findAll(): User[] {
    return this.userService.findAll();
  }

  @Post()
  @ZodResponse({ type: UserDto })
  create(@Body() dto: CreateUserDto): User {
    return this.userService.create(dto);
  }
}
