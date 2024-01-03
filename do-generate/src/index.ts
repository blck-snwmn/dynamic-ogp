import { Buffer } from "node:buffer";
import puppeteer from "@cloudflare/puppeteer";

export type Env = {
	MYBROWSER: puppeteer.BrowserWorker;
	URL: string;
};

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname !== "/generate") {
			return new Response("Not found", { status: 404 });
		}

		const browser = await puppeteer.launch(env.MYBROWSER);
		const page = await browser.newPage();
		await page.setViewport({ width: 300, height: 100 });

		await page.goto(env.URL);

		const img = (await page.screenshot()) as Buffer;
		await browser.close();
		return new Response(img, {
			headers: {
				"content-type": "image/jpeg",
			},
		});
	},
};
