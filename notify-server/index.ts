type NotificationPayload = {
  event: string;
  topic: string;
  payload?: Record<string, unknown>;
};

type WebSocketData = {
  topic: string;
};

const port = Number(process.env.PORT ?? 4001);
const hostname = process.env.HOST ?? "0.0.0.0";
const notifyServerSecret = process.env.NOTIFY_SERVER_SECRET;

if (!notifyServerSecret) {
  throw new Error("NOTIFY_SERVER_SECRET is not set");
}

const server = Bun.serve<WebSocketData>({
  port,
  hostname,
  async fetch(req, bunServer) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return new Response("ok");
    }

    if (url.pathname === "/notify" && req.method === "POST") {
      const secretKey = req.headers.get("x-secret-key");
      if (!secretKey || secretKey !== notifyServerSecret) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      try {
        const body = (await req.json()) as NotificationPayload;

        if (!body.topic || !body.event) {
          return Response.json(
            { error: "topic and event are required" },
            { status: 400 },
          );
        }

        bunServer.publish(
          body.topic,
          JSON.stringify({
            event: body.event,
            payload: body.payload ?? null,
          }),
        );

        return Response.json({ success: true });
      } catch (error) {
        console.error("Error handling notification payload:", error);
        return Response.json(
          { error: "Invalid notification payload" },
          { status: 400 },
        );
      }
    }

    if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
      const topic = url.searchParams.get("topic");

      if (!topic) {
        return new Response("topic is required", { status: 400 });
      }

      const upgraded = bunServer.upgrade(req, {
        data: { topic },
      });

      if (upgraded) {
        return;
      }
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      ws.subscribe(ws.data.topic);
      console.log(`Client subscribed to ${ws.data.topic}`);
    },
    message() {
      // Clients only receive pushed notifications.
    },
    close(ws) {
      console.log(`Client disconnected from ${ws.data.topic}`);
    },
  },
});

console.log(`notify-server listening on http://${hostname}:${server.port}`);
