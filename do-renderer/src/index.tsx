import { Hono } from "hono";
import type { FC } from "hono/jsx";

const app = new Hono();

const Layout: FC = (props) => {
	return (
		<html lang="en">
			<body>{props.children}</body>
		</html>
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
			<p>id: {props.id}</p>
			<p>now: {now.toISOString()}</p>
			<ul>
				{props.messages.map((message) => {
					return <li>{message}!!</li>;
				})}
			</ul>
		</Layout>
	);
};

app.get("/greet/:id", (c) => {
	const { id } = c.req.param();
	const messages = ["Good Morning", "Good Evening", "Good Night"];
	return c.html(<Top messages={messages} id={id} />);
});

export default app;
