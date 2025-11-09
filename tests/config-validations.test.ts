import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
    isValidBindAddress,
    isValidHostname,
    isValidIpAddress,
    isValidIpv4Address,
    isValidIpv6Address,
    isValidOrigin,
    validateBindAddress,
    validateOrigins,
} from '../src/utils/config-validations.js';

describe('config-validations', () => {
    describe('isValidIpv4Address', () => {
        it('should validate correct IPv4 addresses', () => {
            assert.strictEqual(isValidIpv4Address('127.0.0.1'), true);
            assert.strictEqual(isValidIpv4Address('192.168.1.1'), true);
            assert.strictEqual(isValidIpv4Address('0.0.0.0'), true);
            assert.strictEqual(isValidIpv4Address('255.255.255.255'), true);
            assert.strictEqual(isValidIpv4Address('10.0.0.1'), true);
        });

        it('should reject invalid IPv4 addresses', () => {
            assert.strictEqual(isValidIpv4Address('256.1.1.1'), false);
            assert.strictEqual(isValidIpv4Address('192.168.1'), false);
            assert.strictEqual(isValidIpv4Address('192.168.1.1.1'), false);
            assert.strictEqual(isValidIpv4Address('abc.def.ghi.jkl'), false);
            assert.strictEqual(isValidIpv4Address(''), false);
            assert.strictEqual(isValidIpv4Address('localhost'), false);
        });
    });

    describe('isValidIpv6Address', () => {
        it('should validate correct IPv6 addresses', () => {
            assert.strictEqual(isValidIpv6Address('::1'), true);
            assert.strictEqual(isValidIpv6Address('::'), true);
            assert.strictEqual(isValidIpv6Address('2001:0db8:85a3:0000:0000:8a2e:0370:7334'), true);
        });

        it('should reject invalid IPv6 addresses', () => {
            assert.strictEqual(isValidIpv6Address('127.0.0.1'), false);
            assert.strictEqual(isValidIpv6Address('localhost'), false);
            assert.strictEqual(isValidIpv6Address(''), false);
            assert.strictEqual(isValidIpv6Address('invalid'), false);
        });
    });

    describe('isValidIpAddress', () => {
        it('should validate both IPv4 and IPv6 addresses', () => {
            // IPv4
            assert.strictEqual(isValidIpAddress('127.0.0.1'), true);
            assert.strictEqual(isValidIpAddress('192.168.1.1'), true);

            // IPv6
            assert.strictEqual(isValidIpAddress('::1'), true);
            assert.strictEqual(isValidIpAddress('::'), true);
        });

        it('should reject invalid IP addresses', () => {
            assert.strictEqual(isValidIpAddress('localhost'), false);
            assert.strictEqual(isValidIpAddress('256.1.1.1'), false);
            assert.strictEqual(isValidIpAddress(''), false);
            assert.strictEqual(isValidIpAddress('not-an-ip'), false);
        });
    });

    describe('isValidHostname', () => {
        it('should validate correct hostnames', () => {
            assert.strictEqual(isValidHostname('localhost'), true);
            assert.strictEqual(isValidHostname('example.com'), true);
            assert.strictEqual(isValidHostname('subdomain.example.com'), true);
            assert.strictEqual(isValidHostname('my-server'), true);
            assert.strictEqual(isValidHostname('server1'), true);
            assert.strictEqual(isValidHostname('a.b.c.d.example.com'), true);
        });

        it('should reject invalid hostnames', () => {
            assert.strictEqual(isValidHostname(''), false);
            assert.strictEqual(isValidHostname('-invalid'), false);
            assert.strictEqual(isValidHostname('invalid-'), false);
            assert.strictEqual(isValidHostname('inv@lid'), false);
            assert.strictEqual(isValidHostname('127.0.0.1'), false); // IP addresses should not match
        });
    });

    describe('isValidOrigin', () => {
        it('should validate hostnames', () => {
            assert.strictEqual(isValidOrigin('localhost'), true);
            assert.strictEqual(isValidOrigin('example.com'), true);
            assert.strictEqual(isValidOrigin('subdomain.example.com'), true);
        });

        it('should validate IPv4 addresses', () => {
            assert.strictEqual(isValidOrigin('127.0.0.1'), true);
            assert.strictEqual(isValidOrigin('192.168.1.1'), true);
            assert.strictEqual(isValidOrigin('0.0.0.0'), true);
        });

        it('should validate IPv6 addresses', () => {
            assert.strictEqual(isValidOrigin('::1'), true);
            assert.strictEqual(isValidOrigin('::'), true);
        });

        it('should reject invalid origins', () => {
            assert.strictEqual(isValidOrigin(''), false);
            assert.strictEqual(isValidOrigin('inv@lid'), false);
            assert.strictEqual(isValidOrigin('-invalid'), false);
        });
    });

    describe('isValidBindAddress', () => {
        it('should validate IP addresses as bind addresses', () => {
            assert.strictEqual(isValidBindAddress('127.0.0.1'), true);
            assert.strictEqual(isValidBindAddress('0.0.0.0'), true);
            assert.strictEqual(isValidBindAddress('::1'), true);
            assert.strictEqual(isValidBindAddress('192.168.1.1'), true);
        });

        it('should reject non-IP bind addresses', () => {
            assert.strictEqual(isValidBindAddress('localhost'), false);
            assert.strictEqual(isValidBindAddress('example.com'), false);
            assert.strictEqual(isValidBindAddress(''), false);
            assert.strictEqual(isValidBindAddress('256.1.1.1'), false);
        });
    });

    describe('validateOrigins', () => {
        it('should validate arrays of valid origins', () => {
            const result1 = validateOrigins(['127.0.0.1', 'localhost']);
            assert.strictEqual(result1.isValid, true);
            assert.strictEqual(result1.error, undefined);

            const result2 = validateOrigins(['example.com', '192.168.1.1', '::1']);
            assert.strictEqual(result2.isValid, true);
            assert.strictEqual(result2.error, undefined);
        });

        it('should reject arrays with invalid origins', () => {
            const result1 = validateOrigins(['127.0.0.1', 'inv@lid']);
            assert.strictEqual(result1.isValid, false);
            assert.ok(result1.error?.includes('inv@lid'));

            const result2 = validateOrigins(['-invalid']);
            assert.strictEqual(result2.isValid, false);
            assert.ok(result2.error?.includes('-invalid'));
        });

        it('should handle empty arrays', () => {
            const result = validateOrigins([]);
            assert.strictEqual(result.isValid, true);
        });
    });

    describe('validateBindAddress', () => {
        it('should validate valid bind addresses', () => {
            const result1 = validateBindAddress('127.0.0.1');
            assert.strictEqual(result1.isValid, true);
            assert.strictEqual(result1.error, undefined);

            const result2 = validateBindAddress('::1');
            assert.strictEqual(result2.isValid, true);
            assert.strictEqual(result2.error, undefined);
        });

        it('should reject invalid bind addresses with error messages', () => {
            const result1 = validateBindAddress('localhost');
            assert.strictEqual(result1.isValid, false);
            assert.ok(result1.error?.includes('localhost'));
            assert.ok(result1.error?.includes('IPv4 or IPv6'));

            const result2 = validateBindAddress('example.com');
            assert.strictEqual(result2.isValid, false);
            assert.ok(result2.error?.includes('example.com'));
        });
    });
});
