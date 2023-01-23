const redis = require("redis");

const client = redis.createClient({
    socket: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOSTNAME,
    },
    password: process.env.REDIS_PASSWORD
  });

(async () => {
    // Connect to redis server
    await client.connect();
})();


console.log("Attempting to connect to redis");
client.on('connect', () => {
    console.log('Redis Connected!');
});

client.on('ready', () => {
  console.log('Redis Ready!');
});
// Log any error that may occur to the console
client.on("error", (err) => {
    console.log(`Error:${err}`);
});

module.exports = client;