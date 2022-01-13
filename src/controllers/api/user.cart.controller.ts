import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Cart } from 'src/entities/cart.entity';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { RoleCheckedGuard } from 'src/misc/role.checker.guard';
import { CartService } from 'src/services/cart/cart.service';
import { Request } from 'express';
import { AddArticleToCartDto } from 'src/dtos/cart/add.article.cart.dto';
import { EditArticleInCartDto } from 'src/dtos/cart/edit.article.in.cart.dto';

@Controller('api/user/cart')
export class UserCartController {
  constructor(private cartService: CartService) {}

  private async getActiveCartForUserId(userId: number): Promise<Cart> {
    // Mehanizam koji će nam vratiti podatke o traženoj korpi
    // Ako ona postoji
    let cart = await this.cartService.getLastActiveCartByUserId(userId);
    if (!cart) {
      // ako ne postoji ta korpa
      cart = await this.cartService.createNewCartForUser(userId);
    }
    // kreiraj novu
    return await this.cartService.getById(cart.cartId);
  }

  @Get()
  @UseGuards(RoleCheckedGuard)
  @AllowToRoles('user')
  async getCurrentCart(@Req() req: Request): Promise<Cart> {
    return await this.getActiveCartForUserId(req.token.id);
  }

  @Post('addToCart')
  @UseGuards(RoleCheckedGuard)
  @AllowToRoles('user')
  async addToCart(
    @Body() data: AddArticleToCartDto,
    @Req() req: Request,
  ): Promise<Cart> {
    const cart = await this.getActiveCartForUserId(req.token.id);
    return await this.cartService.addArticleToCart(
      cart.cartId,
      data.articleId,
      data.quantity,
    );
  }
  @Patch()
  @UseGuards(RoleCheckedGuard)
  @AllowToRoles('user')
  async changeQuantity(
    @Body() data: EditArticleInCartDto,
    @Req() req: Request,
  ): Promise<Cart> {
    const cart = await this.getActiveCartForUserId(req.token.id);
    return await this.cartService.changeQuantity(
      cart.cartId,
      data.articleId,
      data.quantity,
    );
  }
}
