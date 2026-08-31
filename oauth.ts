/**
 * GitHub OAuth2 (Authorization Code flow). Configure via env vars:
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL
 * Create the OAuth App at https://github.com/settings/developers.
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const GITHUB_USER_URL = 'https://api.github.com/user'

export interface GithubUser {
    id: number
    login: string
    email: string | null
}

export function getGithubAuthorizeUrl(state: string): string {
    const clientId = process.env.GITHUB_CLIENT_ID
    const callbackUrl = process.env.GITHUB_CALLBACK_URL
    if (!clientId || !callbackUrl) {
        throw new Error('GITHUB_CLIENT_ID / GITHUB_CALLBACK_URL not configured')
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: 'read:user user:email',
        state,
    })
    return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`
}

export async function exchangeCodeForGithubUser(code: string): Promise<GithubUser> {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    if (!clientId || !clientSecret) {
        throw new Error('GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not configured')
    }

    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
        }),
    })

    if (!tokenResponse.ok) {
        throw new Error(`GitHub token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
        throw new Error(`GitHub token exchange returned no access_token: ${JSON.stringify(tokenData)}`)
    }

    const userResponse = await fetch(GITHUB_USER_URL, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: 'application/vnd.github+json',
        },
    })

    if (!userResponse.ok) {
        throw new Error(`GitHub user fetch failed: ${userResponse.status}`)
    }

    const user = await userResponse.json()
    return { id: user.id, login: user.login, email: user.email }
}
