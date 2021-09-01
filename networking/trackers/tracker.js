
async function init() {
  console.log("entry");
  eval(await load("connection.js"));
  connect();
}
