import { randomUUID } from 'node:crypto'

/**
 * A small client for Upstash Redis's REST API: one command per request over plain fetch, so it
 * works on serverless hosts like Vercel, where every request can land on a different copy of the
 * app and nothing written to disk is shared between them.
 */
export interface RedisConfig {
	url: string
	token: string
}

/**
 * Upstash's own variable names, or the KV_* names Vercel's Upstash integration sets. Returns
 * null when neither pair is there, and OpenSEO keeps its data in files.
 */
export function redisConfig(
	env: Record<string, string | undefined> = process.env
): RedisConfig | null {
	const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL
	const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN
	if (!url || !token) return null

	return { url: url.replace(/\/+$/, ''), token }
}

/** Sends one command, like `redis(config, 'GET', 'key')`, and returns its result. */
export async function redis(
	config: RedisConfig,
	...command: (string | number)[]
): Promise<unknown> {
	const response = await fetch(config.url, {
		method: 'POST',
		headers: { authorization: `Bearer ${config.token}`, 'content-type': 'application/json' },
		body: JSON.stringify(command),
		cache: 'no-store'
	})
	const body = (await response.json().catch(() => null)) as {
		result?: unknown
		error?: string
	} | null
	if (!response.ok || !body || body.error) {
		throw new Error(`Redis ${command[0]} failed: ${body?.error ?? `HTTP ${response.status}`}`)
	}

	return body.result
}

/** How long a lock lasts if the copy holding it dies before letting go. */
const LOCK_MS = 10_000

/** Deletes the lock only if it's still ours, so a slow writer can't free someone else's. */
const RELEASE = `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0`

/**
 * Runs `work` while holding a lock every copy of the app can see, so two copies updating the
 * same list one after another can't lose each other's changes.
 */
export async function withRedisLock<T>(
	config: RedisConfig,
	key: string,
	work: () => Promise<T>
): Promise<T> {
	const token = randomUUID()
	const giveUpAt = Date.now() + LOCK_MS * 1.5
	while ((await redis(config, 'SET', key, token, 'NX', 'PX', LOCK_MS)) !== 'OK') {
		if (Date.now() > giveUpAt) throw new Error(`Timed out waiting for ${key}`)
		await new Promise((resolve) => setTimeout(resolve, 50))
	}
	try {
		return await work()
	} finally {
		await redis(config, 'EVAL', RELEASE, 1, key, token).catch(() => {})
	}
}
