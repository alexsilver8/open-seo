import { AuditError, newId } from '@server/audit'
import { assertPublicHost, normalizeInputUrl } from '@server/audit/http'
import { addMonitor, listMonitors } from '@server/store'
import { jsonError } from '@server/stream'
import {
	DEFAULT_ALERT_RULES,
	DEFAULT_SCHEDULE,
	mergeAlertRules,
	mergeSchedule,
	nextRunAt,
	type Monitor
} from '@shared/monitors'

export const dynamic = 'force-dynamic'

/** The most monitors one OpenSEO keeps, so a script can't fill the disk with audits. */
const MAX_MONITORS = 200

/** GET /api/monitors: every monitor with its recent runs, newest first. */
export async function GET(): Promise<Response> {
	return Response.json(await listMonitors())
}

/**
 * POST /api/monitors { url, schedule?, alerts? }: starts watching a page. Without a schedule it
 * runs every day at 06:00 UTC; without alert rules it alerts on a 5-point drop, the page going
 * down and an SSL certificate 14 days before it expires.
 */
export async function POST(request: Request): Promise<Response> {
	const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
	let url: string
	try {
		url = normalizeInputUrl(typeof body.url === 'string' ? body.url : '')
		await assertPublicHost(new URL(url).hostname)
	} catch (e) {
		return jsonError(e instanceof AuditError ? e.message : "That address doesn't work.", 422)
	}
	if ((await listMonitors()).length >= MAX_MONITORS) {
		return jsonError(`OpenSEO keeps up to ${MAX_MONITORS} monitors.`, 422)
	}
	const schedule = mergeSchedule(DEFAULT_SCHEDULE, body.schedule)
	const monitor: Monitor = {
		id: newId(),
		url,
		createdAt: new Date().toISOString(),
		paused: false,
		schedule,
		alerts: mergeAlertRules(DEFAULT_ALERT_RULES, body.alerts),
		nextRunAt: nextRunAt(schedule, new Date()).toISOString(),
		runs: [],
		state: { down: false }
	}
	await addMonitor(monitor)

	return Response.json(monitor, { status: 201 })
}
