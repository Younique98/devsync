import { findUserByCredentials } from '../users'

describe('findUserByCredentials', () => {
    it('returns the admin demo user for correct admin credentials', async () => {
        const user = await findUserByCredentials('admin', 'admin123')

        expect(user).not.toBeNull()
        expect(user?.role).toBe('admin')
    })

    it('returns the demo user for correct demo credentials', async () => {
        const user = await findUserByCredentials('demo', 'demo123')

        expect(user).not.toBeNull()
        expect(user?.role).toBe('user')
    })

    it('returns null for a wrong password', async () => {
        const user = await findUserByCredentials('admin', 'wrong-password')

        expect(user).toBeNull()
    })

    it('returns null for an unknown username', async () => {
        const user = await findUserByCredentials('nobody', 'admin123')

        expect(user).toBeNull()
    })
})
