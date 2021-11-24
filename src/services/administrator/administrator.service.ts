import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entities/administrator.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administrator: Repository<Administrator>,
  ) {}

  getAll(): Promise<Administrator[]> {
    // niz administrator
    return this.administrator.find(); // vraća spisaka svih rekorda koji postoje u administrator tabeli
  }

  getById(id: number): Promise<Administrator> {
    return this.administrator.findOne(id);
  }
}
