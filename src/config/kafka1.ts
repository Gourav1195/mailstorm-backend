// import kafka from "kafka-node";

// const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });
// const producer = new kafka.Producer(client);

// producer.on("ready", () => console.log("Kafka Producer is ready"));
// producer.on("error", (err) => console.error("Kafka Producer error:", err));

// export default producer;

// const consumer = new kafka.Consumer(
//     client,
//     [{ topic: "real-time-campaigns" }],
//     { autoCommit: true }
//   );
  
//   consumer.on("message", (message) => {
//     console.log("Real-Time Campaign Triggered:", JSON.parse(message.value as string));
//   });
  
//   consumer.on("error", (err) => console.error("Kafka Consumer Error:", err));
