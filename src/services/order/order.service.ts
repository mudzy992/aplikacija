import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/entities/cart.entity';
import { Order } from 'src/entities/order.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Cart)
    private readonly cart: Repository<Cart>,

    @InjectRepository(Order)
    private readonly order: Repository<Order>,
  ) {}

  async add(cartId: number): Promise<Order | ApiResponse> {
    const order = await this.order.findOne({
      cartId: cartId,
    });

    if (order) {
      return new ApiResponse(
        'error',
        -7001,
        'Već je napravljena narudžba za ovu korpu',
      );
    }

    const cart = await this.cart.findOne(cartId, {
      relations: ['cartArticles'],
    });

    if (!cart) {
      return new ApiResponse('error', -7002, 'Ne postoji takva korpa');
    }
    if (cart.cartArticles.length === 0) {
      return new ApiResponse('error', -7003, 'Korpa je prazna');
    }

    const newOrder: Order = new Order();

    newOrder.cartId = cartId;
    const savedOrder = await this.order.save(newOrder);
    await this.order.save(newOrder);

    return await this.order.findOne(savedOrder.orderId, {
      relations: [
        'cart',
        'cart.user',
        'cart.cartArticles',
        'cart.cartArticles.article',
        'cart.cartArticles.article.category',
        'cart.cartArticles.article.articlePrices'
      ],
    });
  }
}
