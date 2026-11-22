import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

/**
 * Reads a CSV from src/data into typed row objects (header row = keys).
 * Runs synchronously at collection time so rows can drive `test()` generation.
 */
export function readCsv<T extends Record<string, string>>(fileName: string): T[] {
  const filePath = path.resolve(__dirname, '../data', fileName);
  return parse(fs.readFileSync(filePath, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
}
