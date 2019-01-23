import cosmiconfig from 'cosmiconfig';
import path from 'path';

// if in dept, see tsconfig ;-)
export interface Config {
  cwd: string;
  rootDir: string;
  outDir: string;
  srcDir: string;
  includeDir: string | null;
}

const explorer = cosmiconfig('gear');
const configFile = explorer.searchSync();
const configContent = configFile
  ? {
      ...configFile.config,
      cwd: path.dirname(configFile.filepath),
    }
  : {
      cwd: process.cwd(),
    };

export function resolveConfig(conf: Partial<Config> = configContent): Config {
  const cwd = conf.cwd || process.cwd();
  const rootDir = conf.rootDir ? path.resolve(cwd, conf.rootDir) : cwd;
  const outDir = conf.outDir ? path.resolve(rootDir, conf.outDir) : rootDir;
  const srcDir = conf.srcDir ? path.resolve(rootDir, conf.srcDir) : rootDir;
  const includeDir = conf.includeDir ? path.resolve(rootDir, conf.includeDir) : null;

  return {
    cwd,
    rootDir,
    outDir,
    srcDir,
    includeDir,
  };
}

export default resolveConfig();
