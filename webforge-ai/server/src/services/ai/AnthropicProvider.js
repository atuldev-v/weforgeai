import Anthropic from '@anthropic-ai/sdk';
import { AIProvider } from './AIProvider.js';

export class AnthropicProvider extends AIProvider {
  /** @param {{ apiKey: string, model?: string }} config */
  constructor({ apiKey, model }) {
    super();
    if (!apiKey) throw new Error('AnthropicProvider requires an apiKey');
    this.client = new Anthropic({ apiKey });
    this.model = model || 'claude-sonnet-4-6';
  }

  get name() {
    return 'anthropic';
  }

  async complete({ systemPrompt, userPrompt, jsonSchema }) {
    // The Anthropic API doesn't have a first-class json_schema response-format flag
    // (as of this SDK version), so we ask for JSON explicitly in the system prompt
    // and validate/repair in aiService.js. If a schema was provided, append it as
    // an instruction so the model knows the exact shape to produce.
    const schemaInstruction = jsonSchema
      ? `\n\nYou MUST respond with ONLY valid JSON matching this JSON Schema, no markdown fences, no commentary:\n${JSON.stringify(jsonSchema.schema)}`
      : '';

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      system: systemPrompt + schemaInstruction,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const usage = {
      promptTokens: response.usage?.input_tokens ?? 0,
      completionTokens: response.usage?.output_tokens ?? 0,
    };
    return { text, usage };
  }
}
