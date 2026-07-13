import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    console.log('CORS Origin:', origin);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://10.0.2.2:3000',
      'http://127.0.0.1:3000',
      'capacitor://localhost',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:8083',
      'http://localhost:8084',
      'http://localhost:8085',
      'http://localhost:8086',
    ];

    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));

    if (!origin || isDevelopment || isLocalhost) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      console.error('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Authorization',
    'Idempotency-Key',
    'Correlation-ID',
  ],
};
