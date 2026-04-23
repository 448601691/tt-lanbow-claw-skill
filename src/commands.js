import { TikTokAdsClient } from './client.js';
import {
  normalizeCampaignCreateArgs,
  normalizeCampaignListArgs,
  normalizeMediaUploadArgs,
  normalizeReportArgs,
  parseCsvArg,
  parseJsonArg,
  parseStringArg
} from './normalize.js';
import { renderTable } from './output.js';

function helpText() {
  return `tiktok-ads CLI skeleton

Usage:
  tiktok-ads help
  tiktok-ads auth status
  tiktok-ads campaigns list [--page 1 --page-size 20 --status ENABLE --format table]
  tiktok-ads campaigns create --name "Test" --objective TRAFFIC --budget-mode BUDGET_MODE_TOTAL --budget 100
  tiktok-ads campaigns update --payload '{"campaign_id":"123","operation_status":"DISABLE"}'
  tiktok-ads adgroups list
  tiktok-ads adgroups create --payload '{...}'
  tiktok-ads adgroups update --payload '{...}'
  tiktok-ads ads list
  tiktok-ads ads create --payload '{...}'
  tiktok-ads ads update --payload '{...}'
  tiktok-ads reports get --service-type AUCTION --report-type BASIC --data-level AUCTION_AD --metrics spend,clicks
  tiktok-ads media upload-image --file ./demo.png
  tiktok-ads media upload-video --file ./demo.mp4

Env:
  TIKTOK_ACCESS_TOKEN
  TIKTOK_ADVERTISER_ID
  TIKTOK_API_BASE_URL (optional)

Notes:
  - --payload / --query still accept raw TikTok Marketing API fields.
  - Common list/report commands now support --format table for human-readable output.
  - Media upload commands use multipart requests with the current advertiser by default.
`;
}

function buildLocalResult(group, action, request, output = { format: 'json' }, extra = {}) {
  return {
    ok: true,
    command: { group, action },
    request,
    output,
    ...extra
  };
}

export async function runCommand(argv) {
  const [group = 'help', action, ...rest] = argv;
  const client = new TikTokAdsClient();

  if (group === 'help' || group === '--help' || group === '-h') {
    return { ok: true, help: helpText() };
  }

  if (group === 'auth' && action === 'status') {
    return {
      ok: true,
      hasAccessToken: Boolean(client.credentials.accessToken),
      hasAdvertiserId: Boolean(client.credentials.advertiserId),
      baseUrl: client.credentials.baseUrl
    };
  }

  if (group === 'campaigns' && action === 'list') {
    const normalized = normalizeCampaignListArgs(rest);
    return buildLocalResult(group, action, { query: normalized.query }, normalized.output);
  }
  if (group === 'campaigns' && action === 'create') {
    const normalized = normalizeCampaignCreateArgs(rest);
    return buildLocalResult(group, action, { payload: normalized.payload }, normalized.output);
  }
  if (group === 'campaigns' && action === 'update') {
    const payload = parseJsonArg(rest, '--payload', {});
    return client.campaignUpdate(payload);
  }

  if (group === 'adgroups' && action === 'list') {
    const query = parseJsonArg(rest, '--query', {});
    return client.adgroupGet(query);
  }
  if (group === 'adgroups' && action === 'create') {
    const payload = parseJsonArg(rest, '--payload', {});
    return client.adgroupCreate(payload);
  }
  if (group === 'adgroups' && action === 'update') {
    const payload = parseJsonArg(rest, '--payload', {});
    return client.adgroupUpdate(payload);
  }

  if (group === 'ads' && action === 'list') {
    const query = parseJsonArg(rest, '--query', {});
    return client.adGet(query);
  }
  if (group === 'ads' && action === 'create') {
    const payload = parseJsonArg(rest, '--payload', {});
    return client.adCreate(payload);
  }
  if (group === 'ads' && action === 'update') {
    const payload = parseJsonArg(rest, '--payload', {});
    return client.adUpdate(payload);
  }

  if (group === 'reports' && action === 'get') {
    const normalized = normalizeReportArgs(rest);
    return buildLocalResult(group, action, { query: normalized.query }, normalized.output);
  }

  if (group === 'media' && action === 'upload-image') {
    const normalized = normalizeMediaUploadArgs(rest);
    return buildLocalResult(group, action, {
      filePath: normalized.filePath,
      fields: normalized.fields
    }, normalized.output);
  }

  if (group === 'media' && action === 'upload-video') {
    const normalized = normalizeMediaUploadArgs(rest);
    return buildLocalResult(group, action, {
      filePath: normalized.filePath,
      fields: normalized.fields
    }, normalized.output);
  }

  if (group === 'debug' && action === 'echo') {
    return {
      ok: true,
      stringArg: parseStringArg(rest, '--value', null),
      payload: parseJsonArg(rest, '--payload', null)
    };
  }

  if (group === 'debug' && action === 'table') {
    const rows = parseJsonArg(rest, '--rows', []);
    const columns = parseCsvArg(rest, '--columns', []);
    return {
      ok: true,
      rendered: renderTable(rows, columns)
    };
  }

  throw new Error(`Unknown command: ${group} ${action || ''}`.trim());
}

export { helpText };
