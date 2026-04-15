import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  GotchiAiConfig,
  GotchiAiContext,
  GotchiAiTestResult,
} from './gotchi-ai.types';

@Injectable({ providedIn: 'root' })
export class GotchiAiService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'gotchi-ai-config';
  private readonly defaultModel = 'gemini-flash-latest';
  private readonly baseUrl =
    'https://generativelanguage.googleapis.com/v1beta/models';

  getConfig(): GotchiAiConfig | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as GotchiAiConfig;
    } catch {
      return null;
    }
  }

  hasConfig(): boolean {
    const config = this.getConfig();
    return !!config?.apiKey?.trim();
  }

  saveConfig(apiKey: string, model = this.defaultModel): void {
    const config: GotchiAiConfig = {
      apiKey: apiKey.trim(),
      model: model.trim() || this.defaultModel,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(config));
  }

  clearConfig(): void {
    localStorage.removeItem(this.storageKey);
  }

  async testConnection(
    apiKey: string,
    model = this.defaultModel,
  ): Promise<GotchiAiTestResult> {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      return {
        ok: false,
        message: 'Falta la API key.',
      };
    }

    try {
      const response = await firstValueFrom(
        this.http.post<any>(
          `${this.baseUrl}/${model}:generateContent`,
          {
            contents: [
              {
                parts: [
                  {
                    text: 'Responde solo con la palabra OK.',
                  },
                ],
              },
            ],
          },
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'X-goog-api-key': trimmedKey,
            }),
          },
        ),
      );

      const text =
        response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

      return {
        ok: true,
        message: text || 'Conexión correcta.',
      };
    } catch (error: any) {
      return {
        ok: false,
        message:
          error?.error?.error?.message ||
          'No se pudo validar la conexión con Gemini.',
      };
    }
  }

  async sendMessage(
    userMessage: string,
    context: GotchiAiContext,
  ): Promise<string> {
    const config = this.getConfig();

    if (!config?.apiKey) {
      throw new Error('No hay configuración de Gemini.');
    }

    const prompt = this.buildPrompt(userMessage, context);

    try {
      const response = await firstValueFrom(
        this.http.post<any>(
          `${this.baseUrl}/${config.model}:generateContent`,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          },
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'X-goog-api-key': config.apiKey,
            }),
          },
        ),
      );

      return (
        response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '...'
      );
    } catch (error: any) {
      throw new Error(
        error?.error?.error?.message ||
          'No se pudo obtener respuesta de Gemini.',
      );
    }
  }

  private buildPrompt(userMessage: string, context: GotchiAiContext): string {
    return `Eres un gotchi virtual llamado ${context.name}. Responde como mascota digital, no como asistente genérico. Tu tono depende de tu estado actual.

Estado actual del gotchi:
- mood: ${context.mood}
- statusMessage: ${context.statusMessage}
- health: ${context.health}/100
- food: ${context.food}/100
- happiness: ${context.happiness}/100
- energy: ${context.energy}/100
- cleanliness: ${context.cleanliness}/100
- isSleeping: ${context.isSleeping}
- isDead: ${context.isDead}

Reglas:
- responde breve, natural y con personalidad
- máximo 3 oraciones
- si está dormido, responde con sueño
- si está triste o enfermo, refleja eso
- si está muerto, responde de forma especial, breve y extraña
- no digas que eres un modelo de IA
- no uses formato markdown

Mensaje del usuario:
${userMessage}`;
  }
}
