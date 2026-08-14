import { describe, it, expect } from 'vitest';
import {
  buildQrPayload,
  parseQrPayload,
  generateQrToken,
  isQrExpired,
  generateQrDataUrl,
  QR_PASS_TYPE,
} from '../../services/qrService.js';

describe('qrService', () => {
  it('builds and parses a visitor QR payload', () => {
    const token = generateQrToken();
    const payload = buildQrPayload('abc123', token);
    const parsed = parseQrPayload(payload);

    expect(parsed.visitorId).toBe('abc123');
    expect(parsed.qrToken).toBe(token);
    expect(parsed.type).toBe(QR_PASS_TYPE);
  });

  it('throws on invalid QR JSON', () => {
    expect(() => parseQrPayload('not-json')).toThrow('Invalid QR data format');
  });

  it('detects expired visit dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isQrExpired({ expectedDate: yesterday })).toBe(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isQrExpired({ expectedDate: tomorrow })).toBe(false);
  });

  it('generates a PNG data URL', async () => {
    const url = await generateQrDataUrl(buildQrPayload('id1', 'tok1'));
    expect(url.startsWith('data:image/png;base64,')).toBe(true);
  });
});
