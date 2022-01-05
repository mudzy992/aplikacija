import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Feature } from 'entities/feature.entity';
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
        eager: true,
      },
      articles: {
        eager: true,
      },
      category: {
        eager: true,
      },
    },
  },
})
export class FeaturesController {
  constructor(public service: FeaturesService) {}
}
