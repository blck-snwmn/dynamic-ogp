import { Hono } from "hono";

type Bindings = {
	URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/page/:id", (c) => {
	const url = c.req.url;
	const { id } = c.req.param();
	const imageURL = `${c.env.URL}/${id}`;
	console.log(`URL: ${url}`);
	console.log(`id: ${id}`);
	console.log(`imageURL: ${imageURL}`);
	return c.html(`
		<html>
		<head prefix="og: http://ogp.me/ns#">
			<title>Sample Page</title>
			<meta property="og:title" content="Sample Page">
			<meta property="og:site_name" content="Sample Page">
			<meta property="og:type" content="article">
			<meta property="og:url" content="${url}">
			<meta property="og:description" content="This is a sample page.">
			<meta property="og:image" content="${imageURL}">
		</head>
		<body>
			<h1>Sample Page</h1>
			<p>This is a sample page.</p>
			<p>id: ${id}</p>
		</body>
		</html>
	`);
});

export default app;
