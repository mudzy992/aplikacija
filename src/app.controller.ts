import { Controller, Get } from '@nestjs/common';
import { Administrator } from 'entities/administrator.entity';
import { AdministratorService } from './services/administrator/administrator.service';

@Controller()
export class AppController {
  constructor(
    // Uključiti servise administratora
    private administratorService: AdministratorService,
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
}
