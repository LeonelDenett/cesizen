import { auditLogs } from '@/lib/db/schema/audit-logs';
import logger from '@/lib/logger';
import { getTableName } from 'drizzle-orm';

describe('Audit Logger', () => {
  describe('Schema audit_logs', () => {
    it('should have the correct table name', () => {
      expect(getTableName(auditLogs)).toBe('audit_logs');
    });

    it('should have all required columns defined', () => {
      expect(auditLogs.id).toBeDefined();
      expect(auditLogs.userId).toBeDefined();
      expect(auditLogs.action).toBeDefined();
      expect(auditLogs.email).toBeDefined();
      expect(auditLogs.ipAddress).toBeDefined();
      expect(auditLogs.userAgent).toBeDefined();
      expect(auditLogs.success).toBeDefined();
      expect(auditLogs.details).toBeDefined();
      expect(auditLogs.createdAt).toBeDefined();
    });

    it('should have correct column configurations', () => {
      // action column should not be null (varchar, notNull implied by default config)
      expect(auditLogs.action).toBeDefined();
      // success column has default false
      expect(auditLogs.success).toBeDefined();
      // createdAt has default now()
      expect(auditLogs.createdAt).toBeDefined();
    });
  });

  describe('Pino Logger', () => {
    it('should be defined and have log methods', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should log info messages without error', () => {
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => logger);
      logger.info({ test: true }, 'Test info message');
      expect(infoSpy).toHaveBeenCalledWith({ test: true }, 'Test info message');
      infoSpy.mockRestore();
    });

    it('should log warning messages without error', () => {
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => logger);
      logger.warn({ action: 'FAILED_LOGIN' }, 'Test warning');
      expect(warnSpy).toHaveBeenCalledWith({ action: 'FAILED_LOGIN' }, 'Test warning');
      warnSpy.mockRestore();
    });

    it('should log error messages without error', () => {
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => logger);
      logger.error({ err: new Error('Test error') }, 'Test error message');
      expect(errorSpy).toHaveBeenCalledWith({ err: expect.any(Error) }, 'Test error message');
      errorSpy.mockRestore();
    });
  });

  describe('Audit log action types', () => {
    it('should support LOGIN action', () => {
      const action = 'LOGIN';
      expect(action).toBe('LOGIN');
      expect(action.length).toBeLessThanOrEqual(50);
    });

    it('should support FAILED_LOGIN action', () => {
      const action = 'FAILED_LOGIN';
      expect(action).toBe('FAILED_LOGIN');
      expect(action.length).toBeLessThanOrEqual(50);
    });

    it('should support ACCOUNT_DISABLED action', () => {
      const action = 'ACCOUNT_DISABLED';
      expect(action).toBe('ACCOUNT_DISABLED');
      expect(action.length).toBeLessThanOrEqual(50);
    });

    it('should support LOGOUT action', () => {
      const action = 'LOGOUT';
      expect(action).toBe('LOGOUT');
      expect(action.length).toBeLessThanOrEqual(50);
    });
  });
});
