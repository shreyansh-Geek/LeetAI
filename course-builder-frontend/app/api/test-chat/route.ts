export async function POST(req: Request) {
  const { message } = await req.json();

  // Dummy AI response
  return Response.json({
    reply: "AI Response to: " + message
  });
}
