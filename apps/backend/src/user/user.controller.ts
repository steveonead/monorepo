import type { User } from '@superdsp/api-schemas/auth/user';

import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateUserDto } from '@/user/dto/user.dto';
import { UserService } from '@/user/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): User[] {
    return this.userService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto): User {
    return this.userService.create(dto);
  }
}
