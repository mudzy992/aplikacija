import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ArticleFeature } from 'entities/article-feature.entity';
import { ArticleFeatureService } from 'src/services/article-feature/article-feature.service';

@Controller('api/article-feature')
@Crud({
  model: {
    type: ArticleFeature,
  },
  params: {
    id: {
      field: 'articleFeatureId',
      type: 'number',
      primary: true,
    },
  },

  query: {
    join: {
      article: {
        eager: true,
      },
      feature: {
        eager: false,
      },
    },
  },
})
export class ArticleFeatureController {
  constructor(public service: ArticleFeatureService) {}
}
