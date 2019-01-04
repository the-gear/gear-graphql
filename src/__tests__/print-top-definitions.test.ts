import { readFileSync } from 'fs';
import { parse } from 'graphql';
import { resolve } from 'path';
import printTopDefinitions from '../print-top-definitions';

const source = readFileSync(resolve(__dirname, './complex.gql'), 'utf8');

describe('print-kind', () => {
  it('works', () => {
    const document = parse(source);
    const printed = printTopDefinitions(document);
    expect(printed).toMatchSnapshot();
  });
});
