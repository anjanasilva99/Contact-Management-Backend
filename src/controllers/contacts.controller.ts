import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  HttpCode,
  InternalServerErrorException,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ContactsService } from '../services/contacts.service';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { UpdateContactDto } from '../dtos/update-contact.dto';

interface SearchQuery {
  search?: string;
}

interface ValidationError {
  name: string;
  constraints?: { [key: string]: string };
}
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async findAll(@Query() query: SearchQuery): Promise<{
    statusCode: number;
    message: string;
    data: Contact[];
    error?: string;
  }> {
    try {
      const search = query.search?.toString();
      const contacts = await this.contactsService.findAll({ search });

      return {
        statusCode: HttpStatus.OK,
        message: 'Contacts retrieved successfully',
        data: contacts,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'No contacts found',
          data: [], // Add empty array to satisfy the type
          error: error.message,
        };
      }
      throw new InternalServerErrorException('Error retrieving contacts');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<{
    statusCode: number;
    message: string;
    data?: Contact;
    error?: string;
  }> {
    try {
      // Validate if id is a positive number
      if (isNaN(id) || id <= 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contact ID',
          error: 'ID must be a positive number',
        };
      }

      const contact = await this.contactsService.findOne(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Contact retrieved successfully',
        data: contact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Contact with ID ${id} not found`,
          error: error.message,
        };
      }

      throw new InternalServerErrorException('Error retrieving contact');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContactDto: CreateContactDto): Promise<{
    statusCode: number;
    message: string;
    data?: Contact;
    errors?: string[];
  }> {
    try {
      // Check for existing contact with same email
      const existingContact = await this.contactsService.findByEmail(
        createContactDto.email,
      );
      if (existingContact) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Contact with this email already exists',
          errors: ['Email must be unique'],
        };
      }

      // Create new contact
      const contact = await this.contactsService.create(createContactDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Contact created successfully',
        data: contact,
      };
    } catch (error) {
      // Handle validation errors
      const validationError = error as ValidationError;
      if (validationError?.name === 'ValidationError') {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: validationError.constraints
            ? Object.values(validationError.constraints)
            : ['Validation failed'],
        };
      }

      // Handle other errors
      throw new InternalServerErrorException('Error creating contact');
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<{
    statusCode: number;
    message: string;
    data?: Contact;
    error?: string;
    errors?: string[];
  }> {
    try {
      // Validate if id is a positive number
      if (isNaN(id) || id <= 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contact ID',
          error: 'ID must be a positive number',
        };
      }

      // Check if email is being changed and if it already exists
      const existingContact = await this.contactsService.findOne(id);
      if (existingContact && updateContactDto.email !== existingContact.email) {
        const emailExists = await this.contactsService.findByEmail(
          updateContactDto.email,
        );
        if (emailExists) {
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Email already in use',
            error: 'Email must be unique',
          };
        }
      }

      const updatedContact = await this.contactsService.update(
        id,
        updateContactDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Contact updated successfully',
        data: updatedContact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Contact with ID ${id} not found`,
          error: error.message,
        };
      }

      const validationError = error as ValidationError;
      if (validationError?.name === 'ValidationError') {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: validationError.constraints
            ? Object.values(validationError.constraints)
            : ['Validation failed'],
        };
      }

      throw new InternalServerErrorException('Error updating contact');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<{
    statusCode: number;
    message: string;
    data?: Contact;
    error?: string;
  }> {
    try {
      // Validate if id is a positive number
      if (isNaN(id) || id <= 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contact ID',
          error: 'ID must be a positive number',
        };
      }

      // Check if contact exists before deletion
      const contact = await this.contactsService.findOne(id);
      await this.contactsService.delete(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Contact deleted successfully',
        data: contact, // Return the deleted contact data
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Contact with ID ${id} not found`,
          error: error.message,
        };
      }
    }
    throw new InternalServerErrorException('Error deleting contact');
  }
}
