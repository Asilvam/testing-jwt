import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  logger = new Logger('UsersService');
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByid(_id: string): Promise<User | undefined> {
    return this.userModel.findById({ _id }).exec();
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        $or: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      });
      if (existingUser) {
        if (existingUser.username === createUserDto.username) {
          throw new ConflictException('Username already exists');
        }
        if (existingUser.email === createUserDto.email) {
          throw new ConflictException('Email already exists');
        }
      }
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      this.handleCreationError(error);
    }
  }

  private handleCreationError(error: any): never {
    this.logger.error(`Failed to create user: ${error.message}`, error.stack);
    if (error instanceof ConflictException) {
      throw error;
    }
    if (error.name === 'ValidationError') {
      throw new ConflictException(error.message);
    }
    throw new InternalServerErrorException('Failed to create user');
  }

  async findAll() {
    return await this.userModel.find().exec();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
