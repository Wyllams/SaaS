import { Controller, Get, Headers } from "@nestjs/common";
import { IdentityTransportService } from "./identity-transport.service.js";

@Controller("identity")
export class IdentityController {
  constructor(private readonly identityTransport: IdentityTransportService) {}

  @Get("me")
  async currentIdentity(@Headers("authorization") authorization?: string) {
    return this.identityTransport.currentIdentity(authorization);
  }
}
