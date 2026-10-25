/**
 * Common interface every AI provider must implement. This is what lets
 * aiService.js stay provider-agnostic — swapping OpenAI for Anthropic (or a
 * user's own BYOK key) never touches route/controller/business logic.
 */
export class AIProvider {
  /**
   * @param {object} params
   * @param {string} params.systemPrompt
   * @param {string} params.userPrompt
   * @param {object} [params.jsonSchema] - JSON schema the response must conform to.
   * @returns {Promise<{ text: string, usage: { promptTokens: number, completionTokens: number } }>}
   */
  // eslint-disable-next-line no-unused-vars
  async complete({ systemPrompt, userPrompt, jsonSchema }) {
    throw new Error('AIProvider.complete() must be implemented by subclass');
  }

  get name() {
    return 'unknown';
  }
}
