import { Hono } from 'hono'

type Bindings = {
	URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/page/:id', (c) => {
	const { id } = c.req.param()
	return c.html(`
		<html>
		<head>
			<title>Sample Page</title>
			<meta property="og:title" content="Sample Page">
			<meta property="og:description" content="This is a sample page.">
			<meta property="og:image" content="${c.env.URL}?id=${id}">
		</head>
		<body>
			<h1>Sample Page</h1>
			<p>This is a sample page.</p>
			<p>id: ${id}</p>
		</body>
		</html>
		`)
})

export default app