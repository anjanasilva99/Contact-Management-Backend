import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { UpdateContactDto } from '../dtos/update-contact.dto';
import { validate } from 'class-validator';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async findAll({ search = '' }: { search?: string }): Promise<Contact[]> {
    try {
      const query = this.contactRepository.createQueryBuilder('contact');

      if (search) {
        query.where(
          '(contact.name LIKE :search OR contact.email LIKE :search OR contact.phone LIKE :search)',
          {
            search: `%${search}%`,
          },
        );
      }

      query.orderBy('contact.createdAt', 'DESC');
      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException('Database query failed');
    }
  }

  async findOne(id: number): Promise<Contact> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
        select: ['id', 'name', 'email', 'phone', 'createdAt'], // Explicitly specify fields to return
      });

      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      return contact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Database query failed');
    }
  }

  create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(contact);
  }
  async findByEmail(email: string): Promise<Contact | null> {
    return this.contactRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
      });

      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      // Create updated contact object
      const updatedContact = Object.assign(contact, updateContactDto);

      // Validate the updated contact
      const errors = await validate(updatedContact);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      // Save the updated contact
      return await this.contactRepository.save(updatedContact);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update contact');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.contactRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete contact');
    }
  }
}
