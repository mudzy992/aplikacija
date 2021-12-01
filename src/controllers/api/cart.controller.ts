import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Cart } from 'entities/cart.entity';
import { CartService } from 'src/services/cart/cart.service';

@Controller('api/cart')
@Crud({
  model: {
    type: Cart,
  },
  params: {
    id: {
      field: 'cartId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      user: {
        eager: true,
      },
      cartArticles: {
        eager: true,
      },
      order: {
        eager: true,
      },
      // ovdje će trebati napraviti relaciju prema artiklu
    },
  },
})
export class CartController {
  constructor(public service: CartService) {}
}
