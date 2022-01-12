import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/entities/article.entity';
import { CartArticle } from 'src/entities/cart-article.entity';
import { Cart } from 'src/entities/cart.entity';
import { Order } from 'src/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cart: Repository<Cart>,

    @InjectRepository(CartArticle)
    private readonly cartArticle: Repository<CartArticle>,

    @InjectRepository(Article)
    private readonly article: Repository<Article>,

    @InjectRepository(Order)
    private readonly order: Repository<Order>,
  ) {}

  async getLastActiveCartByUserId(userId: number): Promise<Cart | null> {
    const carts = await this.cart.find({
      // Složeni find objekat, nije isto kao klasični koji će uzimati npr. u ovom slučaju userId i vratiti nam rezultat na osnovu njega samo
      // ovaj objekat ima proširene mogućnosti pretrage po nekom parametru kao što ću opisati ispod
      // cilj ovog metoda jeste da izvučemo posljednju aktivnu korpu koju je korisnik kreirao, i da li imaju narudžbu
      // vrati mi korpe koje se u bazi vežu za userId
      where: {
        userId: userId,
      },
      // sortiraj ih po kreiranom datumu - opadajući poredak (logično korisnik može imati jednu korpu, i ta nova je kreirana posljednja)
      order: {
        createdAt: 'DESC',
      },
      // uzmi posljednju korpu
      take: 1,
      // sada kada smo izvukli posljednju korpu, trebamo provjeriti da li postoji narudžba za nju
      // da bi to uradili moramo da uključimo relaciju cart -> order tabela u bazi
      relations: ['order'],
    });
    // ako nema niti jedana korpa vrati null
    if (!carts || carts.length === 0) {
      return null;
    }
    // ako u korpi postoji narudžba, vrati null
    const cart = carts[0];
    if (cart.order !== null) {
      return null;
    }
    // ako je sve uredno, vrati korpu
    return cart;
  }
  async createNewCartForUser(userId: number): Promise<Cart> {
    const newCart: Cart = new Cart();
    newCart.userId = userId;
    return await this.cart.save(newCart);
  }
  async addArticleToCart(cartId: number, articleId: number, qiantity: number) {
    let record: CartArticle = await this.cartArticle.findOne({
      cartId: cartId,
      articleId: articleId,
    });
    if (!record) {
      record = new CartArticle();
      record.cartId = cartId;
      record.articleId = articleId;
      record.quantity = qiantity;
    } else {
      record.quantity += qiantity;
    }
    return await this.cartArticle.save(record);
  }
  async getById(cartId: number): Promise<Cart> {
    return await this.cart.findOne(cartId, {
      relations: [
        'user',
        'cartArticles',
        'cartArticles.artile',
        'cartArticles.artile.category',
      ],
    });
  }
}
