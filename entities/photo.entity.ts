import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from './article.entity';

@Index('uq_photo_image_path', ['imagePath'], { unique: true })
@Entity('photo')
export class Photo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'photo_id', unsigned: true })
  photoId: number;

  @Column('int', { name: 'article_id', unsigned: true, default: () => "'0'" })
  articleId: number;

  @Column('varchar', {
    name: 'image_path',
    unique: true,
    length: 128,
  })
  imagePath: string;

  @OneToOne(() => Article, (article) => article.photo, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'photo_id', referencedColumnName: 'articleId' }])
  photo: Article;
}
