import { Repository, EntityRepository } from 'typeorm';
import category from '../models/Category';

@EntityRepository(category)
class CategoryRepository extends Repository<category> {
  public async findByTitle(title: string): Promise<category | null> {
    const categoryMatch = await this.findOne({ where: { title } });
    return categoryMatch || null;
  }
}

export default CategoryRepository;
