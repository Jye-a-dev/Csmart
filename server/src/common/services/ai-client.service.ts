import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly aiEngineUrl: string;

  // Circuit Breaker state parameters
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private readonly failureThreshold = 3;
  private readonly cooldownPeriodMs = 15000; // 15 seconds in OPEN state before trying HALF_OPEN
  private lastStateChangeTime: number = Date.now();
  private nextAttemptTime = 0;

  constructor(private readonly configService: ConfigService) {
    this.aiEngineUrl =
      this.configService.get<string>('AI_ENGINE_URL') ||
      'http://localhost:8000';
  }

  private updateCircuitState() {
    const now = Date.now();
    if (this.state === CircuitState.OPEN && now >= this.nextAttemptTime) {
      this.state = CircuitState.HALF_OPEN;
      this.lastStateChangeTime = now;
      this.logger.log(
        `Circuit state transitioned to HALF_OPEN. Testing pipeline_ai connectivity.`,
      );
    }
  }

  private recordSuccess() {
    this.failureCount = 0;
    if (this.state !== CircuitState.CLOSED) {
      this.logger.log(
        `Circuit state transitioned to CLOSED. pipeline_ai is healthy.`,
      );
      this.state = CircuitState.CLOSED;
      this.lastStateChangeTime = Date.now();
    }
  }

  private recordFailure(error: unknown) {
    this.failureCount++;
    const errMsg = error instanceof Error ? error.message : String(error);
    this.logger.warn(
      `Failure recorded. Consecutive failure count: ${this.failureCount}. Error: ${errMsg}`,
    );

    if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.failureThreshold
    ) {
      this.tripCircuit();
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.tripCircuit();
    }
  }

  private tripCircuit() {
    this.state = CircuitState.OPEN;
    const now = Date.now();
    this.lastStateChangeTime = now;
    this.nextAttemptTime = now + this.cooldownPeriodMs;
    this.logger.error(
      `Circuit Breaker tripped to OPEN. Restricting requests to pipeline_ai for ${this.cooldownPeriodMs / 1000}s.`,
    );
  }

  /**
   * Executes an HTTP request to pipeline_ai with Circuit Breaker protection.
   */
  async request<T>(
    endpoint: string,
    options: RequestInit,
    fallback: T,
  ): Promise<T> {
    this.updateCircuitState();

    if (this.state === CircuitState.OPEN) {
      this.logger.warn(
        `Circuit is OPEN. Fast failing request to ${endpoint} and returning fallback response.`,
      );
      return fallback;
    }

    const url = `${this.aiEngineUrl}${endpoint}`;

    // Default 15 second timeout for AI requests
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = (await response.json()) as T;
      this.recordSuccess();
      return data;
    } catch (error) {
      clearTimeout(id);
      this.recordFailure(error);
      return fallback;
    }
  }

  getCircuitStateInfo() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastStateChangeTime: new Date(this.lastStateChangeTime).toISOString(),
      nextAttemptTime:
        this.state === CircuitState.OPEN
          ? new Date(this.nextAttemptTime).toISOString()
          : null,
    };
  }
}
