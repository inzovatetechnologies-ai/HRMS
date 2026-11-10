async function test() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@inzovate-technologies.com",
      password: "Inzovate@2026"
    })
  });
  const cookie = loginRes.headers.get("set-cookie");
  console.log("Login Status:", loginRes.status);

  const dashRes = await fetch("http://localhost:3000/dashboard", {
    headers: { Cookie: cookie }
  });
  console.log("Dashboard HTML Status:", dashRes.status);
  const text = await dashRes.text();
  console.log("Dashboard HTML length:", text.length);
  if (text.includes("Error") || text.includes("Exception")) {
    console.log("Contains Error string!");
  }
}

test().catch(console.error);
