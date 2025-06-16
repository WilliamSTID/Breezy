const express = require('express');
const routes = require('./routes/feed.routes');

const app = express();
app.use(express.json());
app.use('/feed', routes);

app.listen(4008, () => {
  console.log('feed service running on port 4008');
});