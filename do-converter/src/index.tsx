import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { Hono } from "hono";
// biome-ignore lint/style/useImportType: <explanation>
import { FC } from "react";
import satori from "satori";
//@ts-ignore
import resvgWasm from "../node_modules/@resvg/resvg-wasm/index_bg.wasm";

await initWasm(resvgWasm);

const app = new Hono();

type Props = {
	children?: React.ReactNode;
};

const Layout: FC<Props> = (props) => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				// backgroundColor: "lightgray",
				padding: "10px",
			}}
		>
			{props.children}
		</div>
	);
};

const Top: FC<{ messages: string[]; id: string }> = (props: {
	messages: string[];
	id: string;
}) => {
	const now = new Date();
	return (
		<Layout>
			<h1>Hello World!</h1>
			<div
				style={{
					display: "flex",
				}}
			>
				id: {props.id}
			</div>
			<div
				style={{
					display: "flex",
				}}
			>
				now: {now.toISOString()}
			</div>
			<ul>
				{props.messages.map((message, index) => {
					// biome-ignore lint/suspicious/noArrayIndexKey: message is static
					return <li key={index}>{message}!!</li>;
				})}
			</ul>
		</Layout>
	);
};

app.get("/greet/:id", async (c) => {
	const familyResp = await fetch(
		"https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700",
	);
	if (!familyResp.ok) {
		throw new Error("Failed to load font data");
	}
	const css = await familyResp.text();
	const resource = css.match(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/,
	);
	if (!resource) {
		throw new Error("Failed to parse font data");
	}

	const fontDataResp = await fetch(resource[1]);
	const fontData = await fontDataResp.arrayBuffer();

	const { id } = c.req.param();
	const messages = ["Good Morning", "Good Evening", "Good Night"];
	const svg = await satori(<Top messages={messages} id={id} />, {
		width: 400,
		height: 200,
		fonts: [
			{
				name: "Roboto",
				data: fontData,
				weight: 400,
				style: "normal",
			},
		],
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: "original",
		},
		background: "lightgray",
	});

	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();
	return new Response(pngBuffer, {
		headers: {
			"Content-Type": "image/png",
		},
	});
});

export default app;
