import OpenAI from 'openai';
import { AIProvider } from './AIProvider.js';

export class OpenAIProvider extends AIProvider {
  /** @param {{ apiKey: string, model?: string }} config */
  constructor({ apiKey, model }) {
    super();
    if (!apiKey) throw new Error('OpenAIProvider requires an apiKey');
    this.client = new OpenAI({ apiKey });
    this.model = model || 'gpt-4.1';
  }

  get name() {
    return 'openai';
  }

  async complete({ systemPrompt, userPrompt, jsonSchema }) {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // Structured Outputs: forces the model to emit JSON that matches jsonSchema exactly,
      // which is what lets aiService.js parse the result without brittle regex/markdown stripping.
      ...(jsonSchema
        ? {
            text: {
              format: {
                type: 'json_schema',
                name: jsonSchema.name || 'webforge_generation',
                schema: jsonSchema.schema,
                strict: true,
              },
            },
          }
        : {}),
      max_output_tokens: 16000,
    });

    const text = response.output_text ?? '';
    const usage = {
      promptTokens: response.usage?.input_tokens ?? 0,
      completionTokens: response.usage?.output_tokens ?? 0,
    };
    return { text, usage };
  }
}
