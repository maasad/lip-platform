import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as http from 'http';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn', 'debug'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: '*',
        credentials: false,
    });

    const port = parseInt(process.env.PORT || '8080', 10);

    const server = http.createServer();
    await app.init();

    server.listen(port, '0.0.0.0', () => {
        console.log(`Application running on port ${port}`);
    });
}

bootstrap().catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
});
