import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CartArticle } from 'src/entities/cart-article.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CartArticleService extends TypeOrmCrudService<CartArticle> {
  constructor(
    @InjectRepository(CartArticle)
    private readonly cartArticle: Repository<CartArticle>, //Čim spomenenom neki repozitorijum moramo da taj repozitoriju evidentiramo u našem osnovnom modulu (app.module.ts)
  ) {
    super(cartArticle);
  }
}
