import { Buffer } from "node:buffer";
import { Hono } from 'hono'
import puppeteer from "@cloudflare/puppeteer";


type Bindings = {
	MYBROWSER: puppeteer.BrowserWorker;
	URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/generate/:id', async (c) => {
	const { id } = c.req.param()

	const browser = await puppeteer.launch(c.env.MYBROWSER);
	const page = await browser.newPage();
	await page.setViewport({ width: 300, height: 100 });

	await page.goto(`${c.env.URL}/${id}`);

	const img = (await page.screenshot()) as Buffer;
	await browser.close();
	return new Response(img, {
		headers: {
			"content-type": "image/jpeg",
		},
	});
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
