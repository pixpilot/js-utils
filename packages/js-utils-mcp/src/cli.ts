#!/usr/bin/env node
import { readPackageVersion, startMcpServer } from '@pixpilot/mcp';
import { SERVER_NAME, SERVER_SUMMARY } from './index';
import { registry } from './registry';

await startMcpServer({
  name: SERVER_NAME,
  version: readPackageVersion(import.meta.url),
  registry,
  summary: SERVER_SUMMARY,
});
