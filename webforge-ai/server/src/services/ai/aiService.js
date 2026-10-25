import { env } from '../../config/env.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { AnthropicProvider } from './AnthropicProvider.js';
import { MockProvider } from './MockProvider.js';
import { projectGenerationSchema, projectModificationSchema } from './schema.js';
import { GENERATION_SYSTEM_PROMPT, MODIFICATION_SYSTEM_PROMPT, buildModificationUserPrompt } from './prompts.js';
import { validateFileList, mergeFiles } from '../../utils/fileTree.js';
import { ApiError } from '../../utils/apiError.js';
import { logger } from '../../utils/logger.js';
import AIUsage from '../../models/AIUsage.js';

/**
 * Resolves which provider instance to use for this request.
 * Priority: user's own BYOK key (if ALLOW_BYOK and they supplied one) > server-configured provider > mock.
 */
function resolveProvider(user) {
  if (env.ALLOW_BYOK && user?.byokProvider && user?.byokKeyDecryptedForRequest) {
    const key = user.byokKeyDecryptedForRequest; // set transiently by the controller after decrypting; never persisted in plain text
    if (user.byokProvider === 'openai') return new OpenAIProvider({ apiKey: key, model: env.OPENAI_MODEL });
    if (user.byokProvider === 'anthropic') return new AnthropicProvider({ apiKey: key, model: env.ANTHROPIC_MODEL });
  }

  switch (env.AI_PROVIDER) {
    case 'openai':
      if (!env.OPENAI_API_KEY) throw ApiError.internal('Server AI provider is OpenAI but OPENAI_API_KEY is not configured.');
      return new OpenAIProvider({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL });
    case 'anthropic':
      if (!env.ANTHROPIC_API_KEY) throw ApiError.internal('Server AI provider is Anthropic but ANTHROPIC_API_KEY is not configured.');
      return new AnthropicProvider({ apiKey: env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL });
    case 'mock':
    default:
      return new MockProvider();
  }
}

function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

function tryParseJson(text) {
  try {
    return JSON.parse(stripCodeFences(text));
  } catch {
    return null;
  }
}

/**
 * Calls the provider and returns a validated { project, files, dependencies, commands, explanation }.
 * If the first response is malformed JSON, retries once with an explicit repair instruction.
 */
async function completeStructured({ provider, systemPrompt, userPrompt, schema }) {
  const first = await provider.complete({ systemPrompt, userPrompt, jsonSchema: schema });
  let parsed = tryParseJson(first.text);

  let usage = first.usage;
  if (!parsed) {
    logger.warn('AI response was not valid JSON on first attempt — retrying with repair instruction', { provider: provider.name });
    const repair = await provider.complete({
      systemPrompt,
      userPrompt: `${userPrompt}\n\nIMPORTANT: Your previous response could not be parsed as JSON. Respond again with ONLY a single valid JSON object matching the required schema — no markdown, no commentary, no trailing text.`,
      jsonSchema: schema,
    });
    parsed = tryParseJson(repair.text);
    usage = {
      promptTokens: usage.promptTokens + repair.usage.promptTokens,
      completionTokens: usage.completionTokens + repair.usage.completionTokens,
    };
  }

  if (!parsed) {
    throw ApiError.internal('Website generation failed. Please try again.');
  }

  if (!parsed.files || !Array.isArray(parsed.files)) {
    throw ApiError.internal('Website generation failed. Please try again.');
  }

  const sanitizedFiles = validateFileList(parsed.files);

  return {
    project: parsed.project || {},
    files: sanitizedFiles,
    dependencies: parsed.dependencies || {},
    commands: parsed.commands || [],
    explanation: parsed.explanation || '',
    usage,
  };
}

async function logUsage({ user, project, provider, model, operation, usage, success, errorMessage }) {
  try {
    await AIUsage.create({
      user: user._id,
      project: project?._id || null,
      provider,
      model,
      operation,
      promptTokens: usage?.promptTokens || 0,
      completionTokens: usage?.completionTokens || 0,
      success,
      errorMessage: errorMessage || null,
    });
  } catch (err) {
    // Usage logging must never break the primary request.
    logger.error('Failed to record AIUsage', err);
  }
}

export async function generateWebsite({ user, prompt }) {
  const provider = resolveProvider(user);
  try {
    const result = await completeStructured({
      provider,
      systemPrompt: GENERATION_SYSTEM_PROMPT,
      userPrompt: prompt,
      schema: projectGenerationSchema,
    });
    await logUsage({ user, project: null, provider: provider.name, model: provider.model || provider.name, operation: 'generate', usage: result.usage, success: true });
    return result;
  } catch (err) {
    await logUsage({ user, project: null, provider: provider.name, model: provider.model || provider.name, operation: 'generate', usage: null, success: false, errorMessage: err.message });
    throw err;
  }
}

export async function modifyWebsite({ user, project, instruction }) {
  const provider = resolveProvider(user);
  const userPrompt = buildModificationUserPrompt({ instruction, files: project.files, framework: project.framework });
  try {
    const result = await completeStructured({
      provider,
      systemPrompt: MODIFICATION_SYSTEM_PROMPT,
      userPrompt,
      schema: projectModificationSchema,
    });
    const mergedFiles = mergeFiles(project.files, result.files);
    await logUsage({ user, project, provider: provider.name, model: provider.model || provider.name, operation: 'modify', usage: result.usage, success: true });
    return { ...result, files: mergedFiles, changedFiles: result.files.map((f) => f.path) };
  } catch (err) {
    await logUsage({ user, project, provider: provider.name, model: provider.model || provider.name, operation: 'modify', usage: null, success: false, errorMessage: err.message });
    throw err;
  }
}
