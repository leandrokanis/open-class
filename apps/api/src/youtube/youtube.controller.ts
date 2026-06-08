import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { YouTubeService } from './youtube.service';
import { VideoInfoResponseDto } from './dto/video-info-response.dto';
import { t } from '../i18n/translate';

@ApiTags('youtube')
@Controller('youtube')
export class YouTubeController {
  constructor(private readonly youtube: YouTubeService) {}

  @Get('info')
  @ApiOperation({ summary: 'Validar URL e buscar duração de um vídeo YouTube' })
  @ApiQuery({ name: 'url', required: true, description: 'URL do vídeo YouTube' })
  @ApiResponse({ status: 200, description: 'videoId e duração em segundos', type: VideoInfoResponseDto })
  @ApiResponse({ status: 400, description: 'Parâmetro url ausente' })
  @ApiResponse({ status: 422, description: 'URL inválida ou vídeo não disponível' })
  async getVideoInfo(@Query('url') url: string): Promise<VideoInfoResponseDto> {
    if (!url) throw new BadRequestException(t('youtube.url_required'));

    const info = await this.youtube.validateAndFetchInfo(url);

    return {
      videoId: info.videoId,
      title: '',
      thumbnailUrl: '',
      authorName: '',
      durationSeconds: info.durationSeconds,
    };
  }
}
