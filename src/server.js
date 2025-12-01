const app = require('./app');
const config = require('./config');

const PORT = config.port || 3003;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
  console.log(`Environment: ${config.env}`);
});
