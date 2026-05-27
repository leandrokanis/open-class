import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('mcp')
@Controller('mcp')
export class McpController {
  @Get('health')
  @ApiOperation({ summary: 'MCP server health check' })
  @ApiResponse({ status: 200, description: 'MCP server is running' })
  health() {
    return { status: 'ok' };
  }
}
