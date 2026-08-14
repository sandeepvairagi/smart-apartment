import { describe, it, expect } from 'vitest';
import { getDashboardPath } from './roleRedirect';
import { ROLES, APP_NAME } from './constants';

describe('getDashboardPath', () => {
  it('routes each role to the correct dashboard', () => {
    expect(getDashboardPath(ROLES.RESIDENT)).toBe('/resident/dashboard');
    expect(getDashboardPath(ROLES.GUARD)).toBe('/guard/dashboard');
    expect(getDashboardPath(ROLES.ADMIN)).toBe('/admin/dashboard');
  });

  it('falls back for unknown roles', () => {
    expect(getDashboardPath('unknown')).toBe('/dashboard');
  });
});

describe('constants', () => {
  it('exports app name and roles', () => {
    expect(APP_NAME).toContain('Smart Apartment');
    expect(ROLES.ADMIN).toBe('admin');
  });
});
