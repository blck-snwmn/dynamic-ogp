// biome-ignore lint/style/useImportType: <explanation>
import { Buffer } from "node:buffer";
import puppeteer from "@cloudflare/puppeteer";
import { Hono } from "hono";

type Bindings = {
	MYBROWSER: puppeteer.BrowserWorker;
	URL: string;
	BROWSER: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/generate/:id", async (c) => {
	console.log(`now: ${new Date()}`);
	const cacheKey = new Request(c.req.url);
	const cache = caches.default;

	const respCahce = await cache.match(cacheKey);
	if (respCahce) {
		console.log("cache hit");
		return respCahce;
	}
	console.log("cache miss");

	const { id } = c.req.param();
	console.log(`id: ${id}`);

	const doid = c.env.BROWSER.idFromName("browser");
	const obj = c.env.BROWSER.get(doid);

	const resp = await obj.fetch(`${c.env.URL}/${id}`);

	c.executionCtx.waitUntil(cache.put(cacheKey, resp.clone()));

	return resp;
});

export default app;

const KEEP_BROWSER_ALIVE_IN_SECONDS = 60;
const TEN_SECONDS = 1000 * 10;

export class Browser {
	state: DurableObjectState;
	storage: DurableObjectStorage;
	env: Bindings;
	keepAliveInSec: number;
	browser: puppeteer.Browser | undefined;
	constructor(state: DurableObjectState, env: Bindings) {
		this.state = state;
		this.storage = this.state.storage;
		this.env = env;
		this.keepAliveInSec = 0;
	}

	async fetch(request: Request): Promise<Response> {
		console.info("call fetch()");
		if (!this.browser) {
			// launch browser if it's not launched
			console.info("launch browser");
			this.browser = await puppeteer.launch(this.env.MYBROWSER);
		}

		this.keepAliveInSec = 0;

		const page = await this.browser.newPage();
		await page.setViewport({ width: 300, height: 100 });
		await page.goto(request.url);
		const img = (await page.screenshot()) as Buffer;

		this.keepAliveInSec = 0;

		const currentAlarm = this.storage.getAlarm();
		if (currentAlarm === null) {
			// set alarm if it's not set
			console.info("set alarm in fetch()");
			this.storage.setAlarm(Date.now() + TEN_SECONDS);
		} else {
			console.info("alarm is already set");
		}

		return new Response(img, {
			headers: {
				"content-type": "image/jpeg",
				"cache-control": "public, s-maxag=3600",
			},
		});
	}

	async alarm() {
		this.keepAliveInSec += 10;
		if (this.keepAliveInSec < KEEP_BROWSER_ALIVE_IN_SECONDS) {
			// set alarm again if browser is alive
			console.info(
				`set alarm again in alarm(): keepAliveInSec: ${this.keepAliveInSec}`,
			);
			this.storage.setAlarm(Date.now() + TEN_SECONDS);
			return;
		}
		console.info("close browser");
	}
}
