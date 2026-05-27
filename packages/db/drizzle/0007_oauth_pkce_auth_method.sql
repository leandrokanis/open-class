ALTER TABLE "oauth_clients"
  ADD COLUMN "token_endpoint_auth_method" varchar(50) NOT NULL DEFAULT 'client_secret_basic';
--> statement-breakpoint
ALTER TABLE "oauth_authorization_codes"
  ADD COLUMN "code_challenge" varchar(128),
  ADD COLUMN "code_challenge_method" varchar(10);
