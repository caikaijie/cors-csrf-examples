'use strict'

import gulp from 'gulp'
import runSequence from 'run-sequence'
import path from 'path'
import { spawn, execSync } from 'child_process'
import nodemon from 'nodemon'

function localbin(name) {
  const po = path.parse(execSync('npm bin', { encoding: 'utf8' }))
  po.base = '.bin'
  po.name = '.bin'
  return path.join(path.format(po), name)
}

gulp.task('start-server', function () {
  nodemon({
    execMap: {
      js: `${localbin('babel-node')}`
    },
    script: path.join(__dirname, 'server/index.js'),
    watch: [ 'server/' ],
    args: [ ]
  }).on('restart', function () {
    console.log('server Restarted!')
  })
})

gulp.task('start-client', function () {
  const wds = spawn(
    `${localbin('webpack-dev-server')}`,
    '--config webpack.config.babel.js -d --hot --inline --progress --color --port 3000'.split(' '),
    { 
      env: process.env,
      cwd: process.cwd(),
      stdio: 'inherit'
    }
  )

  wds.on('close', (code) => {
    console.log(`webpack-dev-server exited with code ${code}`)
  })
})

//////

gulp.task('start', () => {
  runSequence('start-server', 'start-client')
})

// ctrl + c 
process.once('SIGINT', function () {
  process.exit(0)
})
