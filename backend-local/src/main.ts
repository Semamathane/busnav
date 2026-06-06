import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const swaggerPath = 'api-docs';

  // Prevent caching of swagger docs
  app.use(`/${swaggerPath}`, (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Tshwane Bus Tracker API')
    .setDescription('API for the Tshwane A Re Yeng Bus Tracking system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Write swagger.json (skip in read-only production environments)
  try {
    const swaggerJsonPath = path.join(process.cwd(), 'swagger.json');
    fs.writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));
    logger.log(`Swagger JSON written to ${swaggerJsonPath}`);
  } catch (err) {
    logger.warn('Could not write swagger.json (read-only filesystem), skipping.');
  }

  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Tshwane Bus Tracker API',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { font-size: 24px; color: #0B5FB0; }
      .swagger-ui .info .description { color: #13202E; }
      .swagger-ui .opblock-tag { color: #0B5FB0; font-weight: 600; }
    `,
  });

  await app.listen(3000);
  logger.log('Application running on port 3000');
}
bootstrap();
