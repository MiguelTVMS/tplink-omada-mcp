import type { RequestHandler } from './request.js';

/**
 * Generic API operations for the Omada API.
 * Provides an escape hatch for any API call not explicitly covered.
 */
export class GenericOperations {
    constructor(
        private readonly request: RequestHandler,
        private readonly buildPath: (path: string, version?: string) => string
    ) {}

    /**
     * Execute an arbitrary Omada API call.
     */
    public async genericApiCall(
        method: string,
        path: string,
        version = 'v1',
        body?: unknown,
        queryParams?: Record<string, unknown>
    ): Promise<unknown> {
        const fullPath = this.buildPath(path, version);
        return await this.request.request<unknown>({
            method,
            url: fullPath,
            data: body,
            params: queryParams,
        });
    }
}
