import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Category } from 'src/entities/category.entity';
import { ArticlePriceService } from 'src/services/article-price/article-price.service';

@Controller('api/article-price')
@Crud({
  model: {
    type: Category,
  },
  params: {
    id: {
      field: 'articlePriceId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      article: {
        eager: true,
      },
    },
  },
})
export class ArticlePriceController {
  constructor(public service: ArticlePriceService) {}
}
