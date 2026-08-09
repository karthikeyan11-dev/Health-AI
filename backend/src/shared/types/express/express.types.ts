import type { Request, Response } from 'express';
import type { operations } from '../generated/api-types';

type ExtractBody<Op extends keyof operations> = operations[Op] extends {
  requestBody: { content: { 'application/json': infer B } };
}
  ? B
  : operations[Op] extends {
        requestBody?: { content: { 'application/json': infer B } };
      }
    ? B
    : unknown;

type ExtractPath<Op extends keyof operations> = operations[Op] extends {
  parameters: { path: infer P };
}
  ? P
  : operations[Op] extends {
        parameters?: { path?: infer P };
      }
    ? P extends Record<string, string>
      ? P
      : Record<string, string>
    : Record<string, string>;

type ExtractQuery<Op extends keyof operations> = operations[Op] extends {
  parameters: { query: infer Q };
}
  ? Q
  : operations[Op] extends {
        parameters?: { query?: infer Q };
      }
    ? Q extends Record<string, unknown>
      ? Q
      : Record<string, string | undefined>
    : Record<string, string | undefined>;

type ExtractResponse<Op extends keyof operations> = operations[Op] extends {
  responses: { 200: { content: { 'application/json': infer R } } };
}
  ? R
  : operations[Op] extends { responses: { 201: { content: { 'application/json': infer R } } } }
    ? R
    : operations[Op] extends { responses: { 202: { content: { 'application/json': infer R } } } }
      ? R
      : unknown;

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  name?: string;
};

export type TypedRequest<Op extends keyof operations> = Omit<
  Request,
  'body' | 'params' | 'query'
> & {
  body: ExtractBody<Op>;
  params: ExtractPath<Op> & Record<string, string>;
  query: ExtractQuery<Op> & Record<string, string | undefined>;

  user?: AuthenticatedUser;
};

export type TypedResponse<Op extends keyof operations> = Omit<Response, 'json' | 'status'> & {
  json: (
    data: ExtractResponse<Op> | { message: string; errors?: { row: number; reason: string }[] },
  ) => TypedResponse<Op>;
  status: (code: number) => TypedResponse<Op>;
};
