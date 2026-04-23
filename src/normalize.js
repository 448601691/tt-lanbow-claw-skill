export function parseJsonArg(args, flag, defaultValue = undefined) {
  const idx = args.indexOf(flag);
  if (idx === -1) return defaultValue;
  const raw = args[idx + 1];
  if (!raw) throw new Error(`Missing value for ${flag}`);
  return JSON.parse(raw);
}

export function parseStringArg(args, flag, defaultValue = undefined) {
  const idx = args.indexOf(flag);
  if (idx === -1) return defaultValue;
  const value = args[idx + 1];
  if (value === undefined) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

export function parseNumberArg(args, flag, defaultValue = undefined) {
  const raw = parseStringArg(args, flag, undefined);
  if (raw === undefined) return defaultValue;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric value for ${flag}: ${raw}`);
  }
  return value;
}

export function parseCsvArg(args, flag, defaultValue = undefined) {
  const raw = parseStringArg(args, flag, undefined);
  if (raw === undefined) return defaultValue;
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseFormatArg(args, defaultValue = 'json') {
  const format = parseStringArg(args, '--format', defaultValue);
  if (!['json', 'table'].includes(format)) {
    throw new Error(`Unsupported format: ${format}`);
  }
  return format;
}

export function ensureRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required field: ${fieldName}`);
  }
  return value;
}

function parseFiltering(existingFiltering) {
  if (!existingFiltering) return {};
  if (typeof existingFiltering === 'string') {
    try {
      return JSON.parse(existingFiltering);
    } catch {
      return {};
    }
  }
  if (typeof existingFiltering === 'object') return { ...existingFiltering };
  return {};
}

export function normalizeCampaignListArgs(args) {
  const query = { ...(parseJsonArg(args, '--query', {}) || {}) };
  const page = parseNumberArg(args, '--page', undefined);
  const pageSize = parseNumberArg(args, '--page-size', undefined);
  const status = parseStringArg(args, '--status', undefined);

  if (page !== undefined) query.page = page;
  if (pageSize !== undefined) query.page_size = pageSize;
  if (status) {
    const filtering = parseFiltering(query.filtering);
    filtering.campaign_status = status;
    query.filtering = JSON.stringify(filtering);
  }

  return {
    query,
    output: { format: parseFormatArg(args) }
  };
}

export function normalizeCampaignCreateArgs(args) {
  const payload = { ...(parseJsonArg(args, '--payload', {}) || {}) };
  const name = parseStringArg(args, '--name', undefined);
  const objective = parseStringArg(args, '--objective', undefined);
  const budgetMode = parseStringArg(args, '--budget-mode', undefined);
  const budget = parseNumberArg(args, '--budget', undefined);

  if (name !== undefined) payload.campaign_name = name;
  if (objective !== undefined) payload.objective_type = objective;
  if (budgetMode !== undefined) payload.budget_mode = budgetMode;
  if (budget !== undefined) payload.budget = budget;

  ensureRequired(payload.campaign_name, 'campaign_name');

  return {
    payload,
    output: { format: parseFormatArg(args) }
  };
}

export function normalizeReportArgs(args) {
  const query = { ...(parseJsonArg(args, '--query', {}) || {}) };
  const serviceType = parseStringArg(args, '--service-type', undefined);
  const reportType = parseStringArg(args, '--report-type', undefined);
  const dataLevel = parseStringArg(args, '--data-level', undefined);
  const dimensions = parseCsvArg(args, '--dimensions', undefined);
  const metrics = parseCsvArg(args, '--metrics', undefined);

  if (serviceType !== undefined) query.service_type = serviceType;
  if (reportType !== undefined) query.report_type = reportType;
  if (dataLevel !== undefined) query.data_level = dataLevel;
  if (dimensions !== undefined) query.dimensions = JSON.stringify(dimensions);
  if (metrics !== undefined) query.metrics = JSON.stringify(metrics);

  return {
    query,
    output: { format: parseFormatArg(args) }
  };
}

export function normalizeMediaUploadArgs(args) {
  const filePath = ensureRequired(parseStringArg(args, '--file', undefined), 'file');
  const advertiserId = parseStringArg(args, '--advertiser-id', undefined);
  const uploadType = parseStringArg(args, '--upload-type', 'UPLOAD_BY_FILE');
  const imageSignature = parseStringArg(args, '--image-signature', undefined);
  const videoSignature = parseStringArg(args, '--video-signature', undefined);

  const fields = {
    ...(advertiserId ? { advertiser_id: advertiserId } : {}),
    ...(uploadType ? { upload_type: uploadType } : {}),
    ...(imageSignature ? { image_signature: imageSignature } : {}),
    ...(videoSignature ? { video_signature: videoSignature } : {})
  };

  return {
    filePath,
    fields,
    output: { format: parseFormatArg(args) }
  };
}
