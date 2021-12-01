import { Body, Controller, Post } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Article } from 'entities/article.entity';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { ArticleService } from 'src/services/article/article.service';

@Controller('api/article')
@Crud({
  model: {
    type: Article,
  },
  params: {
    id: {
      field: 'articleId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      category: {
        eager: true,
      },
      articleFeatures: {
        eager: true,
      },
      features: {
        // urađena izmjena u article i feature entitetima, naprvljena ManyToMany relacija
        eager: true,
      },
      articlePrices: {
        eager: true,
      },
      cartArticles: {
        eager: false,
      },
      photos: {
        eager: true,
      },
    },
  },
})
export class ArticleController {
  constructor(public service: ArticleService) {}

  // ANOTACIJA za kreiranje novog artikla
  // Anotiram createFull funkciju
  @Post('createFull') // ruta
  // koja će da uzima isto cijeli AddArticleDto
  // obavezno data anotirati kao Body
  createFullArticle(@Body() data: AddArticleDto) {
    // i vraća rezultat servisa kreiranog novog artikla na osnovu tih data
    return this.service.createFullArticle(data);
  }
}
