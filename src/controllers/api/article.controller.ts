import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Article } from 'entities/article.entity';
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
}
