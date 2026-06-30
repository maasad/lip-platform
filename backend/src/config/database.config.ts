import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'lip_user',
  password: process.env.DB_PASSWORD || 'lip_password',
  name: process.env.DB_NAME || 'lip_db',
}));
