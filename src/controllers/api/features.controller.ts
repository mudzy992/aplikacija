import { Controller, UseGuards } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Feature } from 'src/entities/feature.entity';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { RoleCheckedGuard } from 'src/misc/role.checker.guard';
import { FeaturesService } from 'src/services/features/feature.service';

@Controller('api/feature')
@Crud({
  model: {
    type: Feature,
  },
  params: {
    id: {
      field: 'featureId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      articleFeatures: {
        eager: false,
      },
      articles: {
        eager: false,
      },
      category: {
        eager: true,
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
export class FeaturesController {
  constructor(public service: FeaturesService) {}
}
