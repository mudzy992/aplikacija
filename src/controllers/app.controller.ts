import { Controller, Get } from '@nestjs/common';
import { Administrator } from 'entities/administrator.entity';
import { AdministratorService } from '../services/administrator/administrator.service';

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
}
