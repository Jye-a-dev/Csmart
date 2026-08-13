import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from './dto/user.dto';
import { User, UserAddress } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, type: [User] })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.usersService.findAll(limit || 10, offset || 0);
  }

  @Get('count/all')
  @ApiOperation({ summary: 'Count all users' })
  @ApiResponse({ status: 200, type: Number })
  countAll() {
    return this.usersService.countAll();
  }

  @Get('count/by')
  @ApiOperation({ summary: 'Count users by filter' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: Number })
  countBy(@Query('role') role?: string, @Query('is_active') isActive?: string) {
    const filters: Record<string, any> = {};
    if (role) filters.role = role;
    if (isActive) filters.is_active = isActive === 'true';
    return this.usersService.countBy(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: User })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: User })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Address Endpoints
  @Post(':userId/addresses')
  @ApiOperation({ summary: 'Create user address' })
  @ApiResponse({ status: 201, type: UserAddress })
  createAddress(
    @Param('userId') userId: string,
    @Body() dto: CreateUserAddressDto,
  ) {
    return this.usersService.createAddress(userId, dto);
  }

  @Get(':userId/addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({ status: 200, type: [UserAddress] })
  findAddresses(@Param('userId') userId: string) {
    return this.usersService.findAddresses(userId);
  }

  @Patch(':userId/addresses/:addressId')
  @ApiOperation({ summary: 'Update user address' })
  @ApiResponse({ status: 200, type: UserAddress })
  updateAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateUserAddressDto,
  ) {
    return this.usersService.updateAddress(userId, addressId, dto);
  }

  @Delete(':userId/addresses/:addressId')
  @ApiOperation({ summary: 'Delete user address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  removeAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.removeAddress(userId, addressId);
  }
}
