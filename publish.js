import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

const BACKEND = "https://apinucleus.mind-mesh.com";
// const BACKEND = "http://localhost:4000";

function loadCookies() {
  const raw = fs.readFileSync(".plugin_cookie", "utf8");
  const cookies = JSON.parse(raw);

  const extract = (name) => {
    const cookie = cookies.find((c) => c.name === name);
    return cookie ? cookie.value : null;
  };
  return {
    orgId: extract("orgId"),
    userId: extract("userId"),
    tokenRes: extract("tokenRes"),
    username: extract("username"),
  };
}

async function publish() {
  const bundle = fs.createReadStream("./dist/DummyPlugin.js");
  let manifest = JSON.parse(fs.readFileSync("./manifest.json", "utf8"));

  // Load cookie values
  const auth = loadCookies();

  // Rails entry must be absolute
  manifest.entry = `${BACKEND}/uploads/${auth.orgId}/DummyPlugin.js`;
  manifest.auth = {
    orgId: auth.orgId,
    userId: auth.userId,
    tokenRes: auth.tokenRes,
    username: auth.username,
  };
  console.log("Publishing to the Nucleus...");
  const form = new FormData();
  form.append("file", bundle, "DummyPlugin.js");
  form.append("manifest", JSON.stringify(manifest));

  // Send auth metadata too
  form.append("orgId", auth.orgId);
  form.append("userId", auth.userId);
  form.append("tokenRes", auth.tokenRes);
  form.append("username", auth.username);
  //So we need not to send this 4 above as we are adding it already in manifest above

  const res = await fetch(`${BACKEND}/plugins/upload`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });


    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", data);




}

publish();
