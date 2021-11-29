import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Photo } from 'entities/photo.entity';
import { PhotoService } from 'src/services/photo/photo.service';

@Controller('api/photo')
@Crud({
  model: {
    type: Photo,
  },
  params: {
    id: {
      field: 'photoId',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
        article: {
        eager: true,
      },
    },
  },
})
export class PhotoController {
  constructor(public service: PhotoService) {}
}
