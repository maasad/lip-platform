import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

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

    // Listen without awaiting to prevent Socket.io blocking
    app.listen(port, '0.0.0.0').then(() => {
        console.log(`Application running on port ${port}`);
    }).catch((err: Error) => {
        console.error('Listen failed:', err.message);
        process.exit(1);
    });

    // Give the server 2 seconds then confirm it started
    setTimeout(() => {
        console.log(`Server startup initiated on port ${port}`);
    }, 2000);
}

bootstrap().catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
});
