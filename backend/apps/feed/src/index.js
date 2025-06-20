const express = require('express');

const app = express();
app.use(express.json());
app.use('/feed', require('./routes/feed.routes'));

app.listen(4008, () => {
  console.log('feed service running on port 4008');
});