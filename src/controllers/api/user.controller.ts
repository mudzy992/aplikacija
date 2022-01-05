import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { User } from 'entities/user.entity';
import { UserService } from 'src/services/user/user.service';

@Controller('api/user')
@Crud({
  model: {
    type: User,
  },
  params: {
    id: {
      field: 'userId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      carts: {
        eager: true,
      },
      // pretpostavljam da će ovdje trebati napraviti vezu da se vidi koje narudžbe ima user
    },
  },
})
export class UserController {
  constructor(public service: UserService) {}
}
