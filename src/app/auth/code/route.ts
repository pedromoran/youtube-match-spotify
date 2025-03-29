export async function GET(rq: Request, ...rest) {
  console.log("");
  console.log("");
  console.log("");
  console.log("GET /authorization-code");
  console.log(rq.body);
  console.log(rq.headers);
  console.log("");
  console.log("");
  return Response.json({ status: "GET /authorization-code" });
}

export async function POST(rq: Request, ...rest) {
  console.log("");
  console.log("");
  console.log("");
  console.log("GET /authorization-code");
  console.log(rq.body);
  console.log(rq.headers);
  console.log("");
  console.log("");
  return Response.json({ status: "GET /authorization-code" });
}
