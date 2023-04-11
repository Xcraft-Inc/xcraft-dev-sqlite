#!/usr/bin/env node
'use strict';

const path = require('path');
const xFs = require('xcraft-core-fs');

function rebuild(bundlePath) {
  const {spawnSync} = require('child_process');

  const packagePath = path.join(bundlePath, 'package.json');
  const packageDef = xFs.fse.readJSONSync(packagePath);
  const nodeModulesDir = path.join(bundlePath, 'node_modules');

  const electronVersion = packageDef?.devDependencies?.electron?.replace(
    /[^0-9]?([0-9]+\.[0-9]+\.[0-9]+)/,
    '$1'
  );
  if (!electronVersion) {
    return;
  }

  console.log(
    `⚛ if necessary, try to build better-sqlite3 for electron ${electronVersion}`
  );

  const betterSqliteNode = path.join(
    nodeModulesDir,
    '.cache/better-sqlite3/node_better_sqlite3.node'
  );
  const betterSqliteElectron = path.join(
    nodeModulesDir,
    '.cache/better-sqlite3/electron_better_sqlite3.node'
  );

  if (!xFs.fse.existsSync(betterSqliteNode)) {
    xFs.cp(
      path.join(
        nodeModulesDir,
        'better-sqlite3/build/Release/better_sqlite3.node'
      ),
      betterSqliteNode
    );
  }

  if (xFs.fse.existsSync(betterSqliteElectron)) {
    console.log(`⚛ better-sqlite3 for electron is already built`);
    return;
  }

  console.log(`⚛ rebuild in progress...`);
  spawnSync('npm', ['rebuild', 'better-sqlite3'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      npm_config_target: electronVersion,
      npm_config_arch: 'x64',
      npm_config_target_arch: 'x64',
      npm_config_runtime: 'electron',
      npm_config_disturl: 'https://electronjs.org/headers',
      npm_config_build_from_source: 'true',
      CFLAGS: '-Wno-error',
      CXXFLAGS: '-Wno-error',
    },
  });

  xFs.cp(
    path.join(
      nodeModulesDir,
      'better-sqlite3/build/Release/better_sqlite3.node'
    ),
    betterSqliteElectron
  );
}

function main(args) {
  rebuild(args[args.length - 1]);
}

main(process.argv);
