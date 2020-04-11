#

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS Passport Strategy for Firebase Auth using Firebase Admin SDK</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

# Installation

## Install peer dependencies

```bash
npm install passport passport-jwt
npm install --save-dev @types/passport-jwt
```

## Install `@nestjs/passport` for authentication

```bash
npm install @nestjs/passport
```

## Install strategy

```bash
npm install @tfarras/nestjs-firebase-auth
```

# Important

To work with Firebase Auth you need to configure and initialize your firebase app. For this purpose you can use my [module for firebase-admin](https://github.com/tfarras/nestjs-firebase-admin).

# Create strategy

```typescript
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt } from 'passport-jwt';
import { FirebaseAuthStrategy } from '@tfarras/nestjs-firebase-auth';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(FirebaseAuthStrategy, 'firebase') {
  public constructor() {
    super({
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
}
```

Note: You should provide an extractor. More information about passport-jwt extractors you can find here: [http://www.passportjs.org/packages/passport-jwt/#included-extractors](http://www.passportjs.org/packages/passport-jwt/#included-extractors)

# Create `AuthModule` and provide created strategy

```typescript
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { FirebaseStrategy } from "./firebase.strategy";

@Module({
  imports: [PassportModule],
  providers: [FirebaseStrategy],
  exports: [FirebaseStrategy],
  controllers: [],
})
export class AuthModule { }
```

# Import `AuthModule` into `AppModule`

```typescript
import { FirebaseAdminCoreModule } from '@tfarras/nestjs-firebase-admin';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}')),
    FirebaseAdminCoreModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('firebase'),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

```

# Protect your routes

```typescript
import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FirebaseAdminSDK, FIREBASE_ADMIN_INJECT } from '@tfarras/nestjs-firebase-admin';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(FIREBASE_ADMIN_INJECT) private readonly fireSDK: FirebaseAdminSDK,
  ) { }

  @Get()
  @UseGuards(AuthGuard('firebase'))
  getHello() {
    return this.fireSDK.auth().listUsers();
  }
}

```

# Custom second validation

In cases when you want to validate also if user exists in your database, or anything else after successfull Firebase validation you can define custom `validate` method in your strategy.

## Example

```typescript
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { FirebaseAuthStrategy, FirebaseUser } from '@tfarras/nestjs-firebase-auth';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(FirebaseAuthStrategy, 'firebase') {
  public constructor() {
    super({
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: FirebaseUser): Promise<FirebaseUser> {
    // Do here whatever you want and return your user
    return payload;
  }
}
```
