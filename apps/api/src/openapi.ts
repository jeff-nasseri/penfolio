import { ABOUT } from '@penfolio/shared';

/**
 * Hand-authored OpenAPI 3 document describing the PenFolio REST API. Served as
 * raw JSON at /api/openapi.json and rendered by Swagger UI at /api/docs. Kept
 * deliberately compact — request/response bodies are documented as generic
 * objects; the authoritative shapes live in @penfolio/shared.
 */

const bearer = [{ bearerAuth: [] }];

function crud(tag: string, name: string, hasDuplicate = false) {
  const base = `/api/${tag}`;
  const paths: Record<string, unknown> = {
    [base]: {
      get: { tags: [tag], summary: `List ${name}s`, security: bearer, responses: { 200: { description: 'OK' } } },
      post: {
        tags: [tag],
        summary: `Create a ${name}`,
        security: bearer,
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 201: { description: 'Created' } },
      },
    },
    [`${base}/{id}`]: {
      get: { tags: [tag], summary: `Get a ${name}`, security: bearer, parameters: [idParam], responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } } },
      put: {
        tags: [tag],
        summary: `Update a ${name}`,
        security: bearer,
        parameters: [idParam],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'OK' } },
      },
      delete: { tags: [tag], summary: `Delete a ${name}`, security: bearer, parameters: [idParam], responses: { 204: { description: 'Deleted' } } },
    },
  };
  if (hasDuplicate) {
    paths[`${base}/{id}/duplicate`] = {
      post: { tags: [tag], summary: `Duplicate a ${name}`, security: bearer, parameters: [idParam], responses: { 201: { description: 'Created' } } },
    };
  }
  return paths;
}

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };

export function buildOpenApiDocument() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'PenFolio API',
      version: ABOUT.version,
      description:
        'REST API for PenFolio — a self-hosted CV / cover-letter builder with a built-in job tracker. ' +
        'Authenticate at POST /api/auth/login, then pass the returned token as a Bearer header.',
      license: { name: 'MIT', url: 'https://github.com/jeff-nasseri/penfolio/blob/master/LICENSE' },
    },
    servers: [{ url: '/', description: 'This server' }],
    tags: [
      { name: 'auth', description: 'Authentication & password' },
      { name: 'profile', description: 'User profile' },
      { name: 'resumes', description: 'Résumé documents' },
      { name: 'cover-letters', description: 'Cover letter documents' },
      { name: 'tracker', description: 'Job application tracker' },
      { name: 'analytics', description: 'Job-search analytics report' },
      { name: 'settings', description: 'Export / import / purge' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    paths: {
      '/api/health': { get: { tags: ['auth'], summary: 'Health check', responses: { 200: { description: 'OK' } } } },
      '/api/auth/login': {
        post: {
          tags: ['auth'],
          summary: 'Log in and receive a JWT',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } }, required: ['username', 'password'] } } },
          },
          responses: { 200: { description: 'OK' }, 401: { description: 'Invalid credentials' } },
        },
      },
      '/api/auth/logout': { post: { tags: ['auth'], summary: 'Log out', security: bearer, responses: { 200: { description: 'OK' } } } },
      '/api/auth/me': { get: { tags: ['auth'], summary: 'Current user', security: bearer, responses: { 200: { description: 'OK' } } } },
      '/api/auth/change-password': {
        post: {
          tags: ['auth'],
          summary: 'Change password',
          security: bearer,
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } }, required: ['currentPassword', 'newPassword'] } } } },
          responses: { 200: { description: 'OK' }, 400: { description: 'Wrong current password' } },
        },
      },
      '/api/profile': {
        get: { tags: ['profile'], summary: 'Get profile', security: bearer, responses: { 200: { description: 'OK' } } },
        put: { tags: ['profile'], summary: 'Update profile (username / picture / about)', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'OK' } } },
      },
      ...crud('resumes', 'résumé', true),
      ...crud('cover-letters', 'cover letter', true),
      '/api/tracker': { get: { tags: ['tracker'], summary: 'Get the whole board (columns + applications)', security: bearer, responses: { 200: { description: 'OK' } } } },
      '/api/tracker/columns': { post: { tags: ['tracker'], summary: 'Create a column', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Created' } } } },
      '/api/tracker/columns/reorder': { put: { tags: ['tracker'], summary: 'Reorder columns', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'integer' } } } } } } }, responses: { 200: { description: 'OK' } } } },
      '/api/tracker/columns/{id}': {
        put: { tags: ['tracker'], summary: 'Update a column', security: bearer, parameters: [idParam], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'OK' } } },
        delete: { tags: ['tracker'], summary: 'Delete a column (and its applications)', security: bearer, parameters: [idParam], responses: { 204: { description: 'Deleted' } } },
      },
      '/api/tracker/applications': { post: { tags: ['tracker'], summary: 'Create an application', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Created' } } } },
      '/api/tracker/applications/{id}': {
        put: { tags: ['tracker'], summary: 'Update an application', security: bearer, parameters: [idParam], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'OK' } } },
        delete: { tags: ['tracker'], summary: 'Delete an application', security: bearer, parameters: [idParam], responses: { 204: { description: 'Deleted' } } },
      },
      '/api/tracker/applications/{id}/move': { put: { tags: ['tracker'], summary: 'Move an application to a column / position', security: bearer, parameters: [idParam], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { columnId: { type: 'integer' }, sortOrder: { type: 'integer' } } } } } }, responses: { 200: { description: 'OK' } } } },
      '/api/analytics': { get: { tags: ['analytics'], summary: 'Job-search analytics report', security: bearer, responses: { 200: { description: 'OK' } } } },
      '/api/settings/about': { get: { tags: ['settings'], summary: 'About PenFolio', security: bearer, responses: { 200: { description: 'OK' } } } },
      '/api/settings/export': { get: { tags: ['settings'], summary: 'Export all data as JSON', security: bearer, responses: { 200: { description: 'OK' } } } },
      '/api/settings/import': { post: { tags: ['settings'], summary: 'Import JSON (replaces all data)', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'OK' } } } },
      '/api/settings/purge': { post: { tags: ['settings'], summary: 'Delete all data (danger zone)', security: bearer, responses: { 200: { description: 'OK' } } } },
    },
  };
}
