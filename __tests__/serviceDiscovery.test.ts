import { registerWithConsul, deregisterFromConsul } from '../serviceDiscovery'

const originalFetch = global.fetch

afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
})

describe('registerWithConsul', () => {
    it('resolves without throwing when Consul is unreachable', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'))
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

        await expect(registerWithConsul(5001)).resolves.toBeUndefined()
        expect(warnSpy).toHaveBeenCalled()
    })

    it('registers successfully when Consul responds OK', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

        await registerWithConsul(5001)

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/v1/agent/service/register'),
            expect.objectContaining({ method: 'PUT' })
        )
        expect(logSpy).toHaveBeenCalled()
    })
})

describe('deregisterFromConsul', () => {
    it('resolves without throwing when Consul is unreachable', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'))
        jest.spyOn(console, 'warn').mockImplementation(() => {})

        await expect(deregisterFromConsul()).resolves.toBeUndefined()
    })
})
