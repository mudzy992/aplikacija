import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entities/administrator.entity';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
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

  add(data: AddAdministratorDto): Promise<Administrator> {
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').toUpperCase();

    const newAdmin: Administrator = new Administrator();
    newAdmin.username = data.username;
    newAdmin.passwordHash = data.password;

    return this.administrator.save(newAdmin);
  }

  async editById(
    id: number,
    data: EditAdministratorDto,
  ): Promise<Administrator> {
    const admin: Administrator = await this.administrator.findOne(id);
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').toUpperCase();
    admin.passwordHash = passwordHashString;

    return this.administrator.save(admin);
  }
}
