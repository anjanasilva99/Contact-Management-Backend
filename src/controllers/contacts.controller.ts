import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { ContactsService } from '../services/contacts.service';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dtos/create-contact.dto';
import { UpdateContactDto } from '../dtos/update-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async findAll(): Promise<{
    statusCode: number;
    message: string;
    data: Contact[];
  }> {
    const contacts = await this.contactsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Contacts retrieved successfully',
      data: contacts,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const contact = await this.contactsService.findOne(id);
    return {
      statusCode: 200,
      message: 'Contact retrieved successfully',
      data: contact,
    };
  }

  @Post()
  async create(
    @Body() createContactDto: CreateContactDto,
  ): Promise<{ statusCode: number; message: string; data: Contact }> {
    const contact = await this.contactsService.create(createContactDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Contact created successfully',
      data: contact,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<{ statusCode: number; message: string; data: Contact }> {
    const updatedContact = await this.contactsService.update(
      id,
      updateContactDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Contact updated successfully',
      data: updatedContact,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string }> {
    await this.contactsService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Contact deleted successfully',
    };
  }
}
