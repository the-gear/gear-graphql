import { ExtendedDocumentNode, mergeDocuments, sortDocument } from '@the-gear/graphql-rewrite';
import { parse } from 'graphql';
import loadSources from './load-sources';

/**
 * Take many `Source`s, returns one (extended) Document
 *
 * @param sources GraphQL `Source` array
 */
export default async function loadAndMerge(globPattern: string): Promise<ExtendedDocumentNode> {
  const sources = await loadSources(globPattern);
  const parsed = sources.map((source) => parse(source));
  const merged = mergeDocuments(parsed);

  return sortDocument(merged);
}
