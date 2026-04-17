import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  private readonly questions: Question[] = [];

  create(createQuestionDto: CreateQuestionDto): Question {
    this.validateCorrectAnswer(
      createQuestionDto.options,
      createQuestionDto.correctAnswer,
    );

    const question: Question = {
      id: randomUUID(),
      ...createQuestionDto,
    };

    this.questions.push(question);
    return question;
  }

  findAll(): Question[] {
    return this.questions;
  }

  findOne(id: string): Question {
    const question = this.questions.find((item) => item.id === id);

    if (!question) {
      throw new NotFoundException(`Question with id "${id}" not found`);
    }

    return question;
  }

  update(id: string, updateQuestionDto: UpdateQuestionDto): Question {
    const question = this.findOne(id);
    const nextOptions = updateQuestionDto.options ?? question.options;
    const nextCorrectAnswer =
      updateQuestionDto.correctAnswer ?? question.correctAnswer;

    this.validateCorrectAnswer(nextOptions, nextCorrectAnswer);

    Object.assign(question, updateQuestionDto);
    return question;
  }

  remove(id: string): Question {
    const index = this.questions.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Question with id "${id}" not found`);
    }

    const [removed] = this.questions.splice(index, 1);
    return removed;
  }

  private validateCorrectAnswer(
    options: string[],
    correctAnswer: string,
  ): void {
    if (!options.includes(correctAnswer)) {
      throw new BadRequestException(
        'correctAnswer must be one of the provided options',
      );
    }
  }
}
