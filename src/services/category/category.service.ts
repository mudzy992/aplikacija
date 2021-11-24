import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'entities/categories.entitiy';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly category: Repository<Category>,
  ) {}

  getAll(): Promise<Category[]> {
    return this.category.find();
  }

  getById(id: number): Promise<Category> {
    return this.category.findOne(id);
  }

  getByName(name: string): Promise<Category> {
    return this.category.findOne(name);
  }
}
