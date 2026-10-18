import amqp from "amqplib"
import { redisClient } from "../server.js"
import { sql } from "./db.js"

interface CacheInvalidationMessage{
 action:string,
            keys:string[]
}

export const startCacheConsumer=async () => {
    
    try {
        
  const connection=await amqp.connect({
        protocol:"amqp",
        hostname:"localhost",
        port:5672,
        username:"admin",
        password:"admin123"
    })
      const channel=await connection.createChannel()

  const queueName="cache-invalidation"

      await channel.assertQueue(queueName,{durable:true})
  
      console.log("blog service cache consumer started");

      channel.consume(queueName,async(msg)=>{
  
          if (msg) {
            try {
                const content=JSON.parse(msg.content.toString()) as CacheInvalidationMessage
                console.log("blog service recieved cache invalidation message",content);
                     
                if (content.action==="invalidateCache") {
                    console.log("content action");
                    
                    for (let pattern of content.keys) {
                        console.log("pattern",pattern);

                        const allKeys = await redisClient.keys("*");
console.log("All Redis keys:", allKeys);
                        
                       const keys=await redisClient.keys(pattern)
                         console.log("key66",keys);
                         
                       if (keys.length>0) {
                        console.log("keys");
                        
                        await redisClient.del(keys)

                        console.log(`blog service invalidated ${keys.length} cache keys matching :${pattern}`);
                        
                       
      
                         const searchQuery=""

                         const category=""

                         const cacheKey=`blogs:${searchQuery}:${category}`

                         const blogs=await sql`SELECT * FROM blogs ORDER BY create_at DESC`


                         await redisClient.set(cacheKey,JSON.stringify(blogs),{
                            EX:3600
                         })
             
                          console.log("cache rebuild with key",cacheKey);
                          

                       }
                        
                    }
                    channel.ack(msg)
                }
                
            } catch (error) {
                console.error("error processing cache invalidation in blog servie",error);
                channel.nack(msg,false,true)
            }
          }
   

      })
      

    } catch (error) {
        console.error("failed to start rabbitmq consumer")
    }



}