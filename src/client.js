import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveCredentials } from './config.js';
import { requestJson } from './http.js';

export class TikTokAdsClient {
  constructor(options = {}) {
    this.credentials = resolveCredentials(options);
  }

  ensureAuth() {
    if (!this.credentials.accessToken) {
      throw new Error('Missing TIKTOK_ACCESS_TOKEN');
    }
    if (!this.credentials.advertiserId) {
      throw new Error('Missing TIKTOK_ADVERTISER_ID');
    }
  }

  buildUrl(pathname) {
    return `${this.credentials.baseUrl}${pathname}`;
  }

  async post(pathname, payload) {
    this.ensureAuth();
    return requestJson({
      method: 'POST',
      url: this.buildUrl(pathname),
      headers: {
        'Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  async get(pathname, params = {}) {
    this.ensureAuth();
    const url = new URL(this.buildUrl(pathname));
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
    return requestJson({
      method: 'GET',
      url: url.toString(),
      headers: {
        'Access-Token': this.credentials.accessToken
      }
    });
  }

  async postMultipart(pathname, { fields = {}, filePath, fileField = 'file' }) {
    this.ensureAuth();

    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        form.set(key, String(value));
      }
    }

    const buffer = await readFile(filePath);
    const file = new File([buffer], path.basename(filePath));
    form.set(fileField, file);

    return requestJson({
      method: 'POST',
      url: this.buildUrl(pathname),
      headers: {
        'Access-Token': this.credentials.accessToken
      },
      body: form
    });
  }

  campaignCreate(payload) {
    return this.post('/open_api/v1.3/campaign/create/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  campaignGet(payload = {}) {
    return this.get('/open_api/v1.3/campaign/get/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  campaignUpdate(payload) {
    return this.post('/open_api/v1.3/campaign/update/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  adgroupCreate(payload) {
    return this.post('/open_api/v1.3/adgroup/create/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  adgroupGet(payload = {}) {
    return this.get('/open_api/v1.3/adgroup/get/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  adgroupUpdate(payload) {
    return this.post('/open_api/v1.3/adgroup/update/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  adCreate(payload) {
    return this.post('/open_api/v1.3/ad/create/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  adGet(payload = {}) {
    return this.get('/open_api/v1.3/ad/get/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  adUpdate(payload) {
    return this.post('/open_api/v1.3/ad/update/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  reportIntegratedGet(payload = {}) {
    return this.get('/open_api/v1.3/report/integrated/get/', {
      advertiser_id: this.credentials.advertiserId,
      ...payload
    });
  }

  imageUpload({ filePath, fields = {} }) {
    return this.postMultipart('/open_api/v1.3/file/image/ad/upload/', {
      filePath,
      fields: {
        advertiser_id: fields.advertiser_id || this.credentials.advertiserId,
        ...fields
      },
      fileField: 'image_file'
    });
  }

  videoUpload({ filePath, fields = {} }) {
    return this.postMultipart('/open_api/v1.3/file/video/ad/upload/', {
      filePath,
      fields: {
        advertiser_id: fields.advertiser_id || this.credentials.advertiserId,
        ...fields
      },
      fileField: 'video_file'
    });
  }
}
