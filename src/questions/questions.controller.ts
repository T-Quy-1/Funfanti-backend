import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { QuestionsService } from './questions.service';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiCreatedResponse({ type: Question })
  create(@Body() createQuestionDto: CreateQuestionDto): Question {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  @ApiOkResponse({ type: Question, isArray: true })
  findAll(): Question[] {
    return this.questionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one question by id' })
  @ApiParam({
    name: 'id',
    description: 'Question UUID',
    example: '6f859a8d-9f53-4f92-a37b-f6a4d2d8f0af',
  })
  @ApiOkResponse({ type: Question })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Question {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a question by id' })
  @ApiParam({
    name: 'id',
    description: 'Question UUID',
    example: '6f859a8d-9f53-4f92-a37b-f6a4d2d8f0af',
  })
  @ApiOkResponse({ type: Question })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Question {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question by id' })
  @ApiParam({
    name: 'id',
    description: 'Question UUID',
    example: '6f859a8d-9f53-4f92-a37b-f6a4d2d8f0af',
  })
  @ApiOkResponse({ type: Question })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Question {
    return this.questionsService.remove(id);
  }
}
