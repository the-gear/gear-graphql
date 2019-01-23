import prettier from 'prettier';

// tslint:disable-next-line:no-any
export default function jsonStringify(obj: any, replacer?: (key: string, value: any) => any) {
  return prettier.format(JSON.stringify(obj, replacer), {
    parser: 'json',
  });
}
