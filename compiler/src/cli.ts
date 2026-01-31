#!/usr/bin/env node

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, basename, join, resolve } from 'path';
import { parseSpecFile } from './parser.js';
import { generateMarkdown } from './generator.js';
import type { CompilerOptions } from './types.js';

function printUsage(): void {
  console.log(`
LLM UI Spec Compiler

Usage:
  spec-compile <input.spec.xml> [options]

Options:
  -o, --output <file>     Output file path (default: <input>.md)
  --no-prompts            Exclude LLM prompts from output
  -h, --help              Show this help message

Examples:
  spec-compile myapp.spec.xml
  spec-compile myapp.spec.xml -o docs/spec.md
  spec-compile myapp.spec.xml --no-prompts
`);
}

function parseArgs(args: string[]): { input: string; options: Partial<CompilerOptions> } | null {
  const options: Partial<CompilerOptions> = {
    includePrompts: true,
  };

  let input: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    }

    if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
      continue;
    }

    if (arg === '--no-prompts') {
      options.includePrompts = false;
      continue;
    }

    if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      return null;
    }

    // Positional argument = input file
    if (!input) {
      input = arg;
    }
  }

  if (!input) {
    console.error('Error: No input file specified');
    return null;
  }

  return { input, options };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const parsed = parseArgs(args);
  if (!parsed) {
    printUsage();
    process.exit(1);
  }

  const { input, options } = parsed;
  const inputPath = resolve(input);

  // Check input exists
  if (!existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Determine output path
  const outputPath = options.output
    ? resolve(options.output)
    : inputPath.replace(/\.spec\.xml$/, '.md').replace(/\.xml$/, '.md');

  console.log(`Compiling: ${inputPath}`);
  console.log(`Output:    ${outputPath}`);

  try {
    // Parse the spec
    const webapp = parseSpecFile(inputPath);
    console.log(`  Parsed: ${webapp.name} v${webapp.version || '1.0'}`);
    console.log(`    - ${webapp.entities.length} entities`);
    console.log(`    - ${webapp.layouts.length} layouts`);
    console.log(`    - ${webapp.components.length} components`);
    console.log(`    - ${webapp.pages.length} pages`);

    // Generate markdown
    const markdown = generateMarkdown(webapp, options);

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write output
    writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`\nSuccess! Generated ${outputPath}`);

  } catch (error) {
    console.error('\nError:', (error as Error).message);
    process.exit(1);
  }
}

main();
