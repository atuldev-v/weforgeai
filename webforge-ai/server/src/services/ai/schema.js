export const projectGenerationSchema = {
  name: 'webforge_project_generation',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['project', 'files', 'dependencies', 'commands', 'explanation'],
    properties: {
      project: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'description', 'framework'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          framework: { type: 'string', enum: ['static', 'react', 'fullstack'] },
        },
      },
      files: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['path', 'content'],
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
          },
        },
      },
      dependencies: { type: 'object' },
      commands: { type: 'array', items: { type: 'string' } },
      explanation: { type: 'string' },
    },
  },
};

/**
 * Same shape, but for incremental modification: files should only contain the
 * files that changed (added or updated), not a full re-emit of the project.
 */
export const projectModificationSchema = projectGenerationSchema;
