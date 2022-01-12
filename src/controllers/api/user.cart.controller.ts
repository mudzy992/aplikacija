import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Cart } from 'src/entities/cart.entity';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { RoleCheckedGuard } from 'src/misc/role.checker.guard';
import { CartService } from 'src/services/cart/cart.service';
import { Request } from 'express';

@Controller('api/user/cart')
export class UserCartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(RoleCheckedGuard)
  @AllowToRoles('user')
  async getCurrentCart(@Req() req: Request): Promise<Cart> {
    return await this.cartService.getLastActiveCartByUserId(req.token.id)
  } // 35:33 https://youtu.be/wb48-WKbUCQ
}
