import { Controller, UseGuards } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Category } from 'src/entities/category.entity';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { RoleCheckedGuard } from 'src/misc/role.checker.guard';
import { CategoryService } from 'src/services/category/category.service';

@Controller('api/category')
@Crud({
  model: {
    type: Category,
  },
  params: {
    id: {
      field: 'categoryId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      categories: {
        eager: true,
      },
      parentCategory: {
        eager: false,
      },
      features: {
        eager: true,
      },
      articles: {
        eager: false,
      },
    },
  },
  routes: {
    only: [
      'createOneBase',
      'createManyBase',
      'getManyBase',
      'getOneBase',
      'updateOneBase',
    ],
    createOneBase: {
      decorators: [UseGuards(RoleCheckedGuard), AllowToRoles('administrator')],
    },
    createManyBase: {
      decorators: [UseGuards(RoleCheckedGuard), AllowToRoles('administrator')],
    },
    getManyBase: {
      decorators: [
        UseGuards(RoleCheckedGuard),
        AllowToRoles('administrator', 'user'),
      ],
    },
    getOneBase: {
      decorators: [
        UseGuards(RoleCheckedGuard),
        AllowToRoles('administrator', 'user'),
      ],
    },
    updateOneBase: {
      decorators: [UseGuards(RoleCheckedGuard), AllowToRoles('administrator')],
    },
  },
})
export class CategoryController {
  constructor(public service: CategoryService) {}
}
