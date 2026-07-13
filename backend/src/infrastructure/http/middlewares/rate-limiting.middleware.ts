import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface WindowCounter {
  count: number;
  windowStart: number;
}

interface RateLimitEntry {
  perMinute: WindowCounter;
  perHour: WindowCounter;
  perDay: WindowCounter;
}

const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_REQUESTS_PER_HOUR = 50;
const MAX_REQUESTS_PER_DAY = 100;
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private clients = new Map<string, RateLimitEntry>();

  use(req: Request, _res: Response, next: NextFunction): void {
    const ip = req.ip ?? 'unknown';
    const now = Date.now();

    const entry = this.getOrCreateEntry(ip, now);

    this.tick(entry.perMinute, now, MINUTE_MS);
    this.tick(entry.perHour, now, HOUR_MS);
    this.tick(entry.perDay, now, DAY_MS);

    if (entry.perMinute.count > MAX_REQUESTS_PER_MINUTE) {
      throw new ForbiddenException(
        `Límite de peticiones excedido. Máximo ${MAX_REQUESTS_PER_MINUTE} checkouts por minuto permitidos.`,
      );
    }
    if (entry.perHour.count > MAX_REQUESTS_PER_HOUR) {
      throw new ForbiddenException(
        `Límite de peticiones excedido. Máximo ${MAX_REQUESTS_PER_HOUR} checkouts por hora permitidos.`,
      );
    }
    if (entry.perDay.count > MAX_REQUESTS_PER_DAY) {
      throw new ForbiddenException(
        `Límite de peticiones excedido. Máximo ${MAX_REQUESTS_PER_DAY} checkouts por día permitidos.`,
      );
    }

    next();
  }

  private getOrCreateEntry(ip: string, now: number): RateLimitEntry {
    const existing = this.clients.get(ip);
    if (existing) {
      return existing;
    }

    const entry: RateLimitEntry = {
      perMinute: { count: 0, windowStart: now },
      perHour: { count: 0, windowStart: now },
      perDay: { count: 0, windowStart: now },
    };
    this.clients.set(ip, entry);
    return entry;
  }

  private tick(counter: WindowCounter, now: number, windowMs: number): void {
    if (now - counter.windowStart > windowMs) {
      counter.count = 1;
      counter.windowStart = now;
    } else {
      counter.count++;
    }
  }
}
