#!/usr/bin/env node

import yargs from 'yargs'
import getCompiler from './get-compiler'
import printCategoriesModule from './print-categories'
import printPluralsModule from './print-plurals'

function valueCommand(type) {
  const valueDesc = `A numerical value. If left empty, all ${type} plural categories will be printed.`
  return {
    command: `${type} [value]`,
    desc: `Print the ${type} plural category of a value`,
    builder: yargs =>
      yargs.positional('value', { desc: valueDesc }).option('locale', {
        alias: 'l',
        desc: 'Locale identifer',
        type: 'string'
      }),
    handler({ locale, value }) {
      const MakePlural = getCompiler({
        cardinals: type === 'cardinal',
        ordinals: type === 'ordinal'
      })
      const mpc = new MakePlural(locale)
      const mp = mpc.compile() // also fills mpc.categories
      const res = value == null ? mpc.categories[type].join(', ') : mp(value)
      process.stdout.write(res)
    }
  }
}

const moduleCommandBuilder = yargs =>
  yargs
    .positional('locale', {
      desc:
        'Identifiers for locales to include in the module. If left empty, all available locales will be included.'
    })
    .options({
      cardinals: {
        default: true,
        desc: 'Include cardinal plurals',
        type: 'boolean'
      },
      ordinals: {
        default: true,
        desc: 'Include ordinal plurals',
        type: 'boolean'
      },
      umd: {
        desc: 'Output an UMD rather than an ES module',
        type: 'boolean'
      },
      width: {
        alias: 'w',
        desc: 'Fold width for the output',
        type: 'number'
      }
    })

yargs
  .command(valueCommand('cardinal'))
  .command(valueCommand('ordinal'))
  .command({
    command: 'plurals [locale...]',
    desc: 'Print the plural functions as the source of a JS module',
    builder: moduleCommandBuilder,
    handler(args) {
      process.stdout.write(printPluralsModule(args))
    }
  })
  .command({
    command: 'categories [locale...]',
    desc: 'Print the plural categories as the source of a JS module',
    builder: moduleCommandBuilder,
    handler(args) {
      process.stdout.write(printCategoriesModule(args))
    }
  })
  .help()
  .wrap(Math.min(96, yargs.terminalWidth()))
  .parse()
