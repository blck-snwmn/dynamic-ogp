import { Buffer } from "node:buffer";
import { Hono } from "hono";
import puppeteer from "@cloudflare/puppeteer";

type Bindings = {
	MYBROWSER: puppeteer.BrowserWorker;
	URL: string;
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


	console.log(`before: ${new Date()}`);
	const browser = await puppeteer.launch(c.env.MYBROWSER);

	console.log(`after setup(launch): ${new Date()}`);

	const page = await browser.newPage();

	console.log(`after setup(new page): ${new Date()}`);

	await page.setViewport({ width: 300, height: 100 });

	console.log(`after setup(setViewport): ${new Date()}`);

	await page.goto(`${c.env.URL}/${id}`);

	console.log(`after goto: ${new Date()}`);

	const img = (await page.screenshot()) as Buffer;

	c.executionCtx.waitUntil(browser.close());

	console.log(`end: ${new Date()}`);

	const resp = new Response(img, {
		headers: {
			"content-type": "image/jpeg",
			"cache-control": "public, s-maxag=120",
		},
	});

	c.executionCtx.waitUntil(cache.put(cacheKey, resp.clone()));

	return resp;
});

export default app;
