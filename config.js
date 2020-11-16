const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

module.exports = {
  rabbitmq: {
    url: `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/%2F?connection_attempts=3&heartbeat=3600`,
    channel: process.env.RABBITMQ_CHANNEL,
    exchange:process.env.RABBITMQ_EXCHANGE,
  }
}