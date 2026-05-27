import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('oauth')
@Controller('.well-known')
export class WellKnownController {
  @Get('oauth-authorization-server')
  @ApiOperation({ summary: 'OAuth 2.0 Authorization Server Metadata (RFC 8414)' })
  @ApiResponse({ status: 200, description: 'Authorization server metadata document' })
  metadata() {
    const base = process.env.APP_URL ?? 'http://localhost:3001';
    return {
      issuer: base,
      authorization_endpoint: `${base}/oauth/authorize`,
      token_endpoint: `${base}/oauth/token`,
      registration_endpoint: `${base}/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      scopes_supported: ['mcp'],
    };
  }
}
