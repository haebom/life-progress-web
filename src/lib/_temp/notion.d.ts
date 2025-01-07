declare module '@notionhq/client' {
  export class Client {
    constructor(options: { auth: string | undefined });
    databases: {
      query(params: {
        database_id: string;
        filter?: {
          and?: Array<{
            property: string;
            rich_text?: { equals: string };
            select?: { equals: string };
            checkbox?: { equals: boolean };
            date?: {
              before?: string;
              after?: string;
              equals?: string;
              on_or_before?: string;
              on_or_after?: string;
              is_empty?: boolean;
              is_not_empty?: boolean;
            };
          }>;
          or?: Array<{
            property: string;
            rich_text?: { equals: string };
            select?: { equals: string };
            checkbox?: { equals: boolean };
            date?: {
              before?: string;
              after?: string;
              equals?: string;
              on_or_before?: string;
              on_or_after?: string;
              is_empty?: boolean;
              is_not_empty?: boolean;
            };
          }>;
        };
        sorts?: Array<{
          property: string;
          direction: 'ascending' | 'descending';
        }>;
      }): Promise<{
        results: Array<PageObjectResponse | PartialPageObjectResponse>;
      }>;
    };
    pages: {
      create(params: {
        parent: { database_id: string };
        properties: {
          [key: string]: {
            type: string;
            [key: string]: unknown;
          };
        };
      }): Promise<PageObjectResponse>;
      update(params: {
        page_id: string;
        properties?: {
          [key: string]: {
            type: string;
            [key: string]: unknown;
          };
        };
        archived?: boolean;
      }): Promise<PageObjectResponse>;
    };
  }

  export interface PageObjectResponse {
    id: string;
    properties: Record<string, {
      type: string;
      title?: Array<{ plain_text: string }>;
      rich_text?: Array<{ plain_text: string }>;
      number?: number;
      select?: { name: string };
      multi_select?: Array<{ name: string }>;
      date?: { start: string | null };
      checkbox?: boolean;
    }>;
  }

  export interface PartialPageObjectResponse {
    id: string;
  }

  export function isNotionClientError(error: unknown): error is {
    code: string;
    status: number;
    message: string;
  };
}

declare module '@notionhq/client/build/src/api-endpoints' {
  export { PageObjectResponse, PartialPageObjectResponse } from '@notionhq/client';
}

declare module '@notionhq/client/build/src/Client' {
  export { Client } from '@notionhq/client';
} 