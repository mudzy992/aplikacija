import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Photo } from 'entities/photo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PhotoService extends TypeOrmCrudService<Photo> {
  constructor(
    @InjectRepository(Photo)
    private readonly photo: Repository<Photo>, //Čim spomenenom neki repozitorijum moramo da taj repozitoriju evidentiramo u našem osnovnom modulu (app.module.ts)
  ) {
    super(photo);
  }
}
