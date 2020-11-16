const amqp = require('amqp-connection-manager')
const celery = require('celery-node');

const RABBITMQ_HOST = 'localhost';
const RABBITMQ_USER = 'user';
const RABBITMQ_PASS = 'bitnami';
const RABBITMQ_PORT = '5672';

const RABBITMQ_ZILLOW_QUEUE = 'dallas-tx-zillow';
const RABBITMQ_ZILLOW_EXCHANGE = 'amq.direct';
const RABBITMQ_TASK_NAME = 'tasks.dallas-tx-zillow';
const rabbitmq_broker = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/%2F?connection_attempts=3&heartbeat=3600`;

const client = celery.createClient(
    rabbitmq_broker,
    rabbitmq_broker
);

const connection = amqp.connect([rabbitmq_broker]);
connection.on('connect', () => console.log('Connected!'));
connection.on('disconnect', err => console.log('Disconnected.', err));

// Handle an incomming message.
const onMessage = data => {
    try {
        const timeout = 10000;
        const message = JSON.parse(data.content.toString());
        const task = client.createTask(RABBITMQ_TASK_NAME);
        const result = task.applyAsync([message]);

        result.get(timeout).then(function(res) {
            console.log('🐻', res);
        });
        channelWrapper.ack(data);
    } catch(err) {
        console.log('FAILED: ', err);
    }
}

const channelWrapper = connection.createChannel({
    json: true,
    setup: function(channel) {
        return Promise.all([
            channel.assertQueue(RABBITMQ_ZILLOW_QUEUE, { durable: true }),
            channel.assertExchange(RABBITMQ_ZILLOW_EXCHANGE, 'direct'),
            channel.prefetch(10),
            channel.bindQueue(RABBITMQ_ZILLOW_QUEUE, RABBITMQ_ZILLOW_EXCHANGE, '#'),
            channel.consume(RABBITMQ_ZILLOW_QUEUE, onMessage, { noAck: false })
        ]);
    }
});

channelWrapper.waitForConnect()
.then(function() {
    console.log("Listening for messages");
}).catch(function(err) {
    console.log('Error: ', err);
});
