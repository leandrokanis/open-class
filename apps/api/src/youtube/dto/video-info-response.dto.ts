import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VideoInfoResponseDto {
  @ApiProperty({ example: 'dQw4w9WgXcQ' })
  videoId!: string;

  @ApiProperty({ example: 'Never Gonna Give You Up' })
  title!: string;

  @ApiProperty({ example: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' })
  thumbnailUrl!: string;

  @ApiProperty({ example: 'Rick Astley' })
  authorName!: string;

  @ApiPropertyOptional({ example: 213, description: 'Duração em segundos; null se não disponível' })
  durationSeconds!: number | null;
}
