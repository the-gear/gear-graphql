/**
 * Type definitions for @the-gear/graphql-ast 0.0.0
 * Project: https://github.com/the-gear/graphql-ast
 * Definitions by: Pavel Lang <https://github.com/langpavel>
 * Definitions: https://github.com/the-gear/graphql-ast
 * TypeScript Version: 3.2
 */

import {
  ExecutionResult,
  getIntrospectionQuery,
  GraphQLSchema,
  graphqlSync,
  IntrospectionQuery,
} from 'graphql';

export { default as loadSources } from './load-sources';
export { default as printTopDefinitions } from './print-definitions';
export { default as traverseModules } from './traverse-modules';

export function runIntrospectionQuery(schema: GraphQLSchema): ExecutionResult<IntrospectionQuery> {
  return graphqlSync(schema, getIntrospectionQuery({ descriptions: true }));
}
