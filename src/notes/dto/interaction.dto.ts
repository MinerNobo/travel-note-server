import { IsNotEmpty, IsString } from 'class-validator';

export class InteractionDto {
  @IsNotEmpty({ message: '笔记id不能为空' })
  @IsString({ message: '笔记id必须是字符串' })
  travelNoteId: string;
}
