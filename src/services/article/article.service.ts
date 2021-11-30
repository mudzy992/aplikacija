import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ArticleFeature } from 'entities/article-feature.entity';
import { ArticlePrice } from 'entities/article-price.entity';
import { Article } from 'entities/article.entity';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { Repository } from 'typeorm';

@Injectable()
export class ArticleService extends TypeOrmCrudService<Article> {
  constructor(
    @InjectRepository(Article)
    private readonly article: Repository<Article>, //Čim spomenenom neki repozitorijum moramo da taj repozitoriju evidentiramo u našem osnovnom modulu (app.module.ts)

    @InjectRepository(ArticlePrice)
    private readonly articlePrice: Repository<ArticlePrice>, //Čim spomenenom neki repozitorijum moramo da taj repozitoriju evidentiramo u našem osnovnom modulu (app.module.ts)

    @InjectRepository(ArticleFeature)
    private readonly articleFeature: Repository<ArticleFeature>,
    ) {
    super(article);
  }
  // dodavanje novog artikla (koristi add.article.dto.ts)

  async createFullArticle(data: AddArticleDto): Promise <Article | ApiResponse> {
    let newArticle: Article = new Article();
    newArticle.name= data.name;
    newArticle.categoryId= data.categoryId;
    newArticle.excerpt= data.excerpt;
    newArticle.description= data.description;

   let savedArticle = await this.article.save(newArticle);

   let newArticlePrice: ArticlePrice = new ArticlePrice();

   newArticlePrice.articleId = savedArticle.articleId;
   newArticlePrice.price = data.price;

   await this.articlePrice.save(newArticlePrice);

   for(let feature of data.features) {
    let newArticleFeature: ArticleFeature = new ArticleFeature();

    newArticleFeature.articleId = savedArticle.articleId;
    newArticleFeature.featureId = feature.featureId;
    newArticleFeature.value = feature.value;

    await this.articleFeature.save(newArticleFeature);
   }
   
   return await this.article.findOne(savedArticle.articleId, {
     relations: [
       "category",
       "articleFeatures",
       "features",
       "articlePrices",
     ]
   })

  }

}
