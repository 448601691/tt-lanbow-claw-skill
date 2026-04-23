import test from 'node:test';
import assert from 'node:assert/strict';
import { runCommand } from '../src/commands.js';

test('help returns help text', async () => {
  const result = await runCommand(['help']);
  assert.equal(result.ok, true);
  assert.match(result.help, /tiktok-ads CLI skeleton/);
});

test('auth status reflects env presence', async () => {
  process.env.TIKTOK_ACCESS_TOKEN = '***';
  process.env.TIKTOK_ADVERTISER_ID = 'advertiser';
  const result = await runCommand(['auth', 'status']);
  assert.equal(result.ok, true);
  assert.equal(result.hasAccessToken, true);
  assert.equal(result.hasAdvertiserId, true);
});

test('debug echo parses string and payload args', async () => {
  const result = await runCommand(['debug', 'echo', '--value', 'abc', '--payload', '{"x":1}']);
  assert.equal(result.ok, true);
  assert.equal(result.stringArg, 'abc');
  assert.deepEqual(result.payload, { x: 1 });
});

test('campaigns list normalizes pagination and format flags', async () => {
  const result = await runCommand([
    'campaigns',
    'list',
    '--page',
    '3',
    '--page-size',
    '25',
    '--format',
    'table',
    '--status',
    'ENABLE',
    '--query',
    '{"objective_type":"TRAFFIC"}'
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.command.group, 'campaigns');
  assert.equal(result.command.action, 'list');
  assert.equal(result.output.format, 'table');
  assert.deepEqual(result.request.query, {
    page: 3,
    page_size: 25,
    filtering: JSON.stringify({ campaign_status: 'ENABLE' }),
    objective_type: 'TRAFFIC'
  });
});

test('campaigns create normalizes named flags into payload', async () => {
  const result = await runCommand([
    'campaigns',
    'create',
    '--name',
    'Scale US',
    '--objective',
    'TRAFFIC',
    '--budget-mode',
    'BUDGET_MODE_TOTAL',
    '--budget',
    '120.5',
    '--payload',
    '{"landing_page":"https://example.com"}'
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.command.group, 'campaigns');
  assert.equal(result.command.action, 'create');
  assert.deepEqual(result.request.payload, {
    campaign_name: 'Scale US',
    objective_type: 'TRAFFIC',
    budget_mode: 'BUDGET_MODE_TOTAL',
    budget: 120.5,
    landing_page: 'https://example.com'
  });
});

test('reports get normalizes dimensions and metrics', async () => {
  const result = await runCommand([
    'reports',
    'get',
    '--service-type',
    'AUCTION',
    '--report-type',
    'BASIC',
    '--data-level',
    'AUCTION_AD',
    '--dimensions',
    'stat_time_day,ad_id',
    '--metrics',
    'spend,impressions,clicks'
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.output.format, 'json');
  assert.deepEqual(result.request.query, {
    service_type: 'AUCTION',
    report_type: 'BASIC',
    data_level: 'AUCTION_AD',
    dimensions: JSON.stringify(['stat_time_day', 'ad_id']),
    metrics: JSON.stringify(['spend', 'impressions', 'clicks'])
  });
});

test('campaign create requires a campaign name when no payload name provided', async () => {
  await assert.rejects(
    () => runCommand(['campaigns', 'create', '--objective', 'TRAFFIC']),
    /campaign_name/
  );
});

test('table format renders rows with selected columns', async () => {
  const result = await runCommand([
    'debug',
    'table',
    '--rows',
    '[{"campaign_id":"1","campaign_name":"Alpha","spend":12.3},{"campaign_id":"2","campaign_name":"Beta","spend":45}]',
    '--columns',
    'campaign_id,campaign_name,spend'
  ]);

  assert.equal(result.ok, true);
  assert.match(result.rendered, /campaign_id/);
  assert.match(result.rendered, /campaign_name/);
  assert.match(result.rendered, /Alpha/);
  assert.match(result.rendered, /Beta/);
});

test('media image upload requires file path', async () => {
  await assert.rejects(() => runCommand(['media', 'upload-image']), /file/i);
});

test('media image upload normalizes metadata', async () => {
  const result = await runCommand([
    'media',
    'upload-image',
    '--file',
    '/tmp/demo.png',
    '--advertiser-id',
    'adv-override',
    '--upload-type',
    'UPLOAD_BY_FILE',
    '--image-signature',
    'sig-1'
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.command.group, 'media');
  assert.equal(result.command.action, 'upload-image');
  assert.equal(result.request.filePath, '/tmp/demo.png');
  assert.deepEqual(result.request.fields, {
    advertiser_id: 'adv-override',
    upload_type: 'UPLOAD_BY_FILE',
    image_signature: 'sig-1'
  });
});

test('unknown command throws', async () => {
  await assert.rejects(() => runCommand(['nope']), /Unknown command/);
});
