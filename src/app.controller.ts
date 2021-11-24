import { Controller, Get } from '@nestjs/common';
import { Administrator } from 'entities/administrator.entity';
import { Category } from 'entities/categories.entitiy';
import { AdministratorService } from './services/administrator/administrator.service';
import { CategoryService } from './services/category/category.service';

@Controller()
export class AppController {
  constructor(
    // Uključiti servise administratora
    private administratorService: AdministratorService,
    private categoryService: CategoryService,
  ) {}
  @Get() // ovako izgleda homepage locahost:3000
  getHello(): string {
    return 'hello world home page';
  }
  @Get('api/administrator') // dodajemo link localhost:3000/world
  getAllAdministrator(): Promise<Administrator[]> {
    // Vraća isto što i servis, obećanje da će vratiti niz administratora
    return this.administratorService.getAll();
  }
  @Get('api/adminID') // dodajemo link localhost:3000/world
  getByIdAdministrator(): Promise<Administrator> {
    // Vraća isto što i servis, obećanje da će vratiti jednog administratora
    const brojA = 1;
    return this.administratorService.getById(brojA);
  }
  @Get('category/all') // dodajemo link localhost:3000/world
  GetAllCategory(): Promise<Category[]> {
    // Vraća isto što i servis, obećanje da će vratiti jednog administratora
    return this.categoryService.getAll();
  }
  @Get('category/byId') // dodajemo link localhost:3000/world
  GetByIdCategory(): Promise<Category> {
    // Vraća isto što i servis, obećanje da će vratiti jednog administratora
    const id = 3;
    return this.categoryService.getById(id);
  }
  @Get('category/Name') // dodajemo link localhost:3000/world
  GetByNameCategory(): Promise<Category> {
    // Vraća isto što i servis, obećanje da će vratiti jednog administratora
    const ime = 'Periferija';
    return this.categoryService.getByName(ime);
  }
}
