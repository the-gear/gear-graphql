import { readFileSync } from 'fs';
import { parse } from 'graphql';
import { resolve } from 'path';
import printDefinitions from '../print-definitions';

const source = readFileSync(resolve(__dirname, './complex.gql'), 'utf8');

describe('print-kind', () => {
  it('works', () => {
    const document = parse(source);
    const printed = printDefinitions(document);
    expect(printed).toMatchSnapshot();
  });
});
