import { Module } from "@nestjs/common";
import { createDatabase, createIdentityRepository } from "@saas/db";
import { HealthController } from "./health.controller.js";
import { IdentityController } from "./identity/identity.controller.js";
import {
  IDENTITY_REPOSITORY,
  IDENTITY_TOKEN_VERIFIER,
  IdentityTransportService,
} from "./identity/identity-transport.service.js";
import { verifySupabaseAccessToken } from "./identity/supabase-token-verifier.js";

@Module({
  controllers: [HealthController, IdentityController],
  providers: [
    {
      provide: IDENTITY_REPOSITORY,
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;
        return connectionString
          ? createIdentityRepository(createDatabase(connectionString))
          : null;
      },
    },
    {
      provide: IDENTITY_TOKEN_VERIFIER,
      useValue: verifySupabaseAccessToken,
    },
    IdentityTransportService,
  ],
})
export class AppModule {}
