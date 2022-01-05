import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Order } from 'entities/order.entity';
import { OrderService } from 'src/services/order/order.service';

@Controller('api/order')
@Crud({
  model: {
    type: Order,
  },
  params: {
    id: {
      field: 'orderId',
      type: 'number',
    },
  },
  query: {
    join: {
      cart: {
        eager: true,
      },
      // Ovdje će trebati napraviti relaciju prema user, cart article
    },
  },
})
export class OrderController {
  constructor(public service: OrderService) {}
}
