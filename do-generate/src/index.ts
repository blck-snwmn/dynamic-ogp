import { Buffer } from "node:buffer";
import { Hono } from 'hono'
import puppeteer from "@cloudflare/puppeteer";


type Bindings = {
	MYBROWSER: puppeteer.BrowserWorker;
	URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/generate/:id', async (c) => {
	const cacheKey = new Request(c.req.url)
	const cache = caches.default

	const respCahce = await cache.match(cacheKey)
	if (respCahce) {
		console.log("cache hit")
		return respCahce
	}
	console.log("cache miss")

	const { id } = c.req.param()
	console.log(`id: ${id}`)

	const browser = await puppeteer.launch(c.env.MYBROWSER);
	const page = await browser.newPage();
	await page.setViewport({ width: 300, height: 100 });

	await page.goto(`${c.env.URL}/${id}`);

	const img = (await page.screenshot()) as Buffer;

	c.executionCtx.waitUntil(browser.close())

	const resp = new Response(img, {
		headers: {
			"content-type": "image/jpeg",
			"cache-control": "public, s-maxag=120",
		},
	})

	await cache.put(cacheKey, resp.clone())
	console.log("cache put")

	return resp;
})

export default app;

// export type Env = {
// 	URL: string;
// };

// export default {
// 	async fetch(
// 		request: Request,
// 		env: Env,
// 		ctx: ExecutionContext,
// 	): Promise<Response> {
// 		
// 	},
// };
