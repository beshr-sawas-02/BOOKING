import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    return this.packagesService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePackageDto) {
    return this.packagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.remove(id);
  }

  @Post(':id/hotels/:hotelId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  addHotel(
    @Param('id', ParseIntPipe) id: number,
    @Param('hotelId', ParseIntPipe) hotelId: number,
  ) {
    return this.packagesService.addHotel(id, hotelId);
  }

  @Delete(':id/hotels/:hotelId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  removeHotel(
    @Param('id', ParseIntPipe) id: number,
    @Param('hotelId', ParseIntPipe) hotelId: number,
  ) {
    return this.packagesService.removeHotel(id, hotelId);
  }
}
