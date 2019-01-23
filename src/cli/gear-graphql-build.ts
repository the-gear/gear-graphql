// tslint:disable:no-console
import { ExtendedDocumentNode } from '@the-gear/graphql-rewrite';
import c from 'ansi-colors';
import fs from 'fs';
import { assertValidSchema, buildASTSchema, DocumentNode, GraphQLSchema, print } from 'graphql';
import { generate } from 'graphql-code-generator';
import mkdirp from 'mkdirp';
import path from 'path';
import { promisify } from 'util';
import { printTopDefinitions, runIntrospectionQuery, traverseModules } from '..';
import config from '../config';
import jsonStringify from '../json-stringify';
import { GraphQLModule } from '../traverse-modules';

// console.log('CONFIG:', config);

const asyncMkdirp = promisify(mkdirp);
const writeFile = promisify(fs.writeFile);

let errCount = 0;
const mkTargetPath = (...args: string[]) => path.resolve(config.outDir, ...args);

let isoDate = new Date().toISOString();

async function writeIntrospectionJSON(schema: GraphQLSchema, fileName: string) {
  const introspection = runIntrospectionQuery(schema);
  const formatted = jsonStringify(introspection);
  await writeFile(fileName, formatted);

  return schema;
}

async function writeTypeDefs(typeDefs: DocumentNode, fileName: string): Promise<typeof typeDefs> {
  // const typeDefs = { ...typeDefs, sources: undefined };
  const replacer = <T>(key: string, value: T): T | undefined => {
    // strip sources
    if (key === 'sources') {
      return;
    }
    // location is useless in this form - start, end index without file.. :-p
    if (key === 'loc') {
      return;
    }

    return value;
  };
  const formatted = jsonStringify(typeDefs, replacer);
  await writeFile(fileName, formatted);

  return typeDefs;
}

async function writeGraphQLfromAST(ast: ExtendedDocumentNode, fileName: string, header?: string) {
  const source = print(ast);
  await writeFile(fileName, header ? `${header}\n${source}` : source);

  return ast;
}

async function writeModule({ name, moduleAst, typeDefs }: GraphQLModule) {
  const moduleDistPath = mkTargetPath(name);
  await asyncMkdirp(moduleDistPath);

  if (moduleAst) {
    await writeGraphQLfromAST(
      moduleAst,
      path.join(moduleDistPath, 'schema.raw.graphql'),
      `# Own GraphQL Schema without implicitly imported types\n# Generated at ${isoDate}\n`,
    );
  }

  // Find and merge all needed definitions from `common`
  if (typeDefs) {
    await writeGraphQLfromAST(
      typeDefs,
      path.join(moduleDistPath, 'schema.graphql'),
      `# GraphQL Schema\n# Generated at ${isoDate}\n`,
    );
    await writeTypeDefs(typeDefs, path.join(moduleDistPath, 'typeDefs.json'));
    const schema = buildASTSchema(typeDefs);
    assertValidSchema(schema);
    const introspectionFileName = path.join(moduleDistPath, 'introspection.json');
    await writeIntrospectionJSON(schema, introspectionFileName);

    console.log(
      printTopDefinitions(typeDefs, {
        color: true,
        rootDir: path.resolve(config.rootDir, './schema/modules/'),
      }),
    );

    const typesDir = path.join(moduleDistPath, 'types');
    await asyncMkdirp(typesDir);
    try {
      await generate(
        {
          schema: introspectionFileName,
          overwrite: true,
          // documents: './src/**/*.graphql',
          config: {
            noNamespaces: true,
            enumsAsTypes: true,
            immutableTypes: true,
          },
          generates: {
            [path.join(typesDir, './server.ts')]: {
              plugins: [
                { add: '/* tslint:disable */\n// THIS FILE IS GENERATED. DO NOT EDIT!' },
                'time',
                'typescript-common',
                'typescript-server',
                'typescript-resolvers',
              ],
            },
            [path.join(typesDir, './client.tsx')]: {
              plugins: [
                { add: '/* tslint:disable */\n// THIS FILE IS GENERATED. DO NOT EDIT!' },
                'time',
                'typescript-common',
                'typescript-client',
                'typescript-react-apollo',
              ],
            },
          },
        },
        true,
      );
    } catch (err) {
      errCount++;
      console.error(c.red.bold(`ERROR: graphql-code-generator failed:`), err);
    }
  } else {
    errCount++;
    console.error(c.red.bold(`ERROR: typeDefs was not generated`));
  }
}

async function run() {
  isoDate = new Date().toISOString();
  errCount = 0;
  await asyncMkdirp(config.outDir);
  await traverseModules(path.join(config.srcDir, './**/*.graphql'), writeModule);
  if (errCount > 0) {
    throw new Error(`${errCount} module(s) not build`);
  }
}

run().catch((err) => {
  console.error(c.bold.red(`FATAL ERROR: ${(err as Error).message || err}`));
  process.exit(1);
});
