import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { McpOAuthRepository } from './mcp-oauth.repository';
import { McpOAuthService } from './mcp-oauth.service';
import { McpOAuthController } from './mcp-oauth.controller';
import { WellKnownController } from './well-known.controller';

@Module({
  imports: [UsersModule],
  providers: [McpOAuthRepository, McpOAuthService],
  controllers: [McpOAuthController, WellKnownController],
  exports: [McpOAuthService],
})
export class McpOAuthModule {}
