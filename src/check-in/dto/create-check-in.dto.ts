import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCheckInDto {
  @IsString({ message: '城市名称必须是字符串' })
  @IsNotEmpty({ message: '城市名称不能为空' })
  cityName: string;

  @IsNumber({}, { message: '纬度必须是数字' })
  @IsNotEmpty({ message: '纬度不能为空' })
  latitude: number;

  @IsNumber({}, { message: '经度必须是数字' })
  @IsNotEmpty({ message: '经度不能为空' })
  longitude: number;
}
