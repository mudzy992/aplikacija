import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get() // ovako izgleda homepage locahost:3003
  getHello(): string {
    return 'hello world home page from backend';
  }
}
