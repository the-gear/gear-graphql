// tslint:disable:no-magic-numbers

import {
  ExtendedDefinitionNode,
  ExtendedDocumentNode,
  firstSourceToken,
  isNamedNode,
  printKind,
} from '@the-gear/graphql-rewrite';
import c from 'ansi-colors';
import { Location } from 'graphql';
import path from 'path';
import terminalLink from 'terminal-link';

interface PrintOptions {
  color: boolean;
  rootDir: string;
}

const KIND_LENGTH = 10;
const NAME_LENGTH = 40;
const EXT_PAD = KIND_LENGTH + NAME_LENGTH + 4;

function locLink(loc: Location | null | undefined, options: PrintOptions): string {
  if (!loc) {
    return '';
  }

  const real = firstSourceToken(loc.startToken);
  const url = `vscode://file/${loc.source.name}:${real.line}:${real.column}`;

  const relativeName = path.relative(options.rootDir || '.', loc.source.name);

  const text = `${relativeName}:${real.line}:${real.column}`;
  if (!(options && options.color)) {
    return text;
  }

  return terminalLink(text, url);
}

function formatDefinitionPosition(def: ExtendedDefinitionNode, options: PrintOptions) {
  const { color } = options;
  const formattedKind = printKind(def.kind).padEnd(KIND_LENGTH);
  let location = def.locExtra || '';
  if (def.loc) {
    location = `* ${locLink(def.loc, options)}`;
    if (def.loc.extensions) {
      location += def.loc.extensions
        .map((extLoc) => {
          return `\n${' + '.padStart(EXT_PAD)}${locLink(extLoc, options)}`;
        })
        .join('');
    }
  }

  let name = '';
  if (isNamedNode(def)) {
    name = def.name.value;
  }

  return [
    color ? (def.isImplicitDep ? c.yellow : c.yellowBright.bold)(formattedKind) : formattedKind,
    name.padEnd(NAME_LENGTH),
    color ? c.blueBright(location) : location,
  ].join(' ');
}

export default function printDefinitions(
  document: ExtendedDocumentNode,
  options: Partial<PrintOptions> = {},
) {
  const opts: PrintOptions = {
    ...options,
    color: !!options.color,
    rootDir: typeof options.rootDir !== 'undefined' ? options.rootDir : process.cwd(),
  };

  const out: string[] = [];

  document.definitions.forEach((def) => {
    // tslint:disable-next-line: no-console
    out.push(formatDefinitionPosition(def, opts));
  });

  return out.join('\n');
}
