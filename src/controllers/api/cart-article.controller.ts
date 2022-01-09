import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { CartArticle } from 'src/entities/cart-article.entity';
import { CartArticleService } from 'src/services/cart-article/cart-article.service';

@Controller('api/cart-article')
@Crud({
  model: {
    type: CartArticle,
  },
  params: {
    id: {
      field: 'cartArticleId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      article: {
        eager: true,
      },
      cart: {
        eager: true,
      },
      // ovdje će vjerovatno trebati napraviti relaciju user-a
    },
  },
})
export class CartArticleController {
  constructor(public service: CartArticleService) {}
}
