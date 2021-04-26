import { JwtFromRequestFunction } from 'passport-jwt';

export interface FirebaseAuthStrategyOptions {
  extractor: JwtFromRequestFunction;
  checkRevoked?: boolean;
}
