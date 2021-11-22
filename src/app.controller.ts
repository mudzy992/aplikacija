import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get() // ovako izgleda homepage locahost:3000
  getHello(): string {
    return "hello world home page";
  }
  @Get("world") // dodajemo link localhost:3000/world
  getWorld(): string {
    return "hello world edit";
  }
}
