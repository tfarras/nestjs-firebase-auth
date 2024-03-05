import { Logger } from '@nestjs/common';
import { JwtFromRequestFunction } from 'passport-jwt';
import { Strategy } from 'passport-strategy';
import { Request } from 'express';
import { FirebaseAuthStrategyOptions } from './interface/options.interface';
import { UNAUTHORIZED, FIREBASE_AUTH } from './constants';
import { FirebaseUser } from './user.type';
import * as admin from 'firebase-admin';

export class FirebaseAuthStrategy extends Strategy {
  readonly name = FIREBASE_AUTH;
  private checkRevoked = false;

  constructor(
    options: FirebaseAuthStrategyOptions,
    private extractor: JwtFromRequestFunction,
    private logger = new Logger(FirebaseAuthStrategy.name),
  ) {
    super();

    if (!options.extractor) {
      throw new Error(
        '\n Extractor is not a function. You should provide an extractor. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme',
      );
    }

    this.extractor = options.extractor;
    this.checkRevoked = options.checkRevoked;
  }

  async validate(payload: FirebaseUser): Promise<any> {
    return payload;
  }

  async authenticate(req: Request): Promise<void> {
    const idToken = this.extractor(req);

    if (!idToken) {
      this.fail(UNAUTHORIZED, 401);
      return;
    }

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken, this.checkRevoked);
      await this.validateDecodedIdToken(decodedIdToken);
    } catch (e) {
      this.logger.error(e);
      this.fail(e, 401);
    }
  }

  private async validateDecodedIdToken(decodedIdToken: FirebaseUser) {
    const result = await this.validate(decodedIdToken);

    if (result) {
      this.success(result);
    }

    this.fail(UNAUTHORIZED, 401);
  }
}
