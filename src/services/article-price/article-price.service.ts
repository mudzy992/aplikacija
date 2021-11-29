import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ArticlePrice } from 'entities/article-price.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArticlePriceService extends TypeOrmCrudService<ArticlePrice> {
  constructor(
    @InjectRepository(ArticlePrice)
    private readonly articlePrice: Repository<ArticlePrice>, //Čim spomenenom neki repozitorijum moramo da taj repozitoriju evidentiramo u našem osnovnom modulu (app.module.ts)
  ) {
    super(articlePrice);
  }
}
