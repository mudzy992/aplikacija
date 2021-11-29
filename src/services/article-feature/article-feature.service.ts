import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ArticleFeature } from 'entities/article-feature.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArticleFeatureService extends TypeOrmCrudService<ArticleFeature> {
  constructor(
    @InjectRepository(ArticleFeature)
    private readonly articleFeature: Repository<ArticleFeature>, //Čim spomenenom neki repozitorijum moramo da taj repozitoriju evidentiramo u našem osnovnom modulu (app.module.ts)
  ) {
    super(articleFeature);
  }
}
