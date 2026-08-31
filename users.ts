import bcrypt from 'bcryptjs'
import type { Role } from './auth'

export interface DemoUser {
    id: string
    username: string
    passwordHash: string
    role: Role
}

/**
 * In-memory demo user store so the login flow can be exercised end-to-end
 * without a real database table for users. NOT for production use - swap
 * this for a real users table (Postgres, via database.ts) before deploying
 * anywhere real users would sign in.
 *
 * Demo credentials: admin/admin123, demo/demo123
 */
const DEMO_USERS: DemoUser[] = [
    {
        id: 'admin',
        username: 'admin',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
    },
    {
        id: 'demo',
        username: 'demo',
        passwordHash: bcrypt.hashSync('demo123', 10),
        role: 'user',
    },
]

export async function findUserByCredentials(
    username: string,
    password: string
): Promise<DemoUser | null> {
    const user = DEMO_USERS.find((u) => u.username === username)
    if (!user) {
        return null
    }
    const matches = await bcrypt.compare(password, user.passwordHash)
    return matches ? user : null
}
