import amqp from "amqplib";
let channel;
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username: "admin",
            password: "admin123"
        });
        channel = await connection.createChannel();
        console.log("connected to rabbit mq");
    }
    catch (error) {
        console.error("failed to connection", error);
    }
};
export const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.error("Rabbit mq channel is not initalized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true
    });
};
export const invalidateChacheJob = async (cacheKeys) => {
    try {
        const message = {
            action: "invalidateCache",
            keys: cacheKeys
        };
        await publishToQueue("cache-invalidation", message);
        console.log("cache invalidation job published to rabbitmq");
    }
    catch (error) {
        console.error("failed to publish cache on", error);
    }
};
//# sourceMappingURL=rabbitmq.js.map