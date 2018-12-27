const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util')
const keys = require('../config/keys')
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget)
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '')

    return this;
}

mongoose.Query.prototype.exec = async function(){
    if(!this.useCache){
        console.log("NOT CACHED")
        return exec.apply(this,arguments);
    }
     console.log("IM ABOUT TO RUN A QUERY");
    
   const key = JSON.stringify(Object.assign({},this.getQuery(),{
        collection:this.mongooseCollection.name
        })
    );

    //See if we have a value for 'key' in redis  
        const cacheValue = await client.hget(this.hashKey,key);
    //if we do , return that
        if(cacheValue){
            console.log(key);
            const data = JSON.parse(cacheValue);
            console.log(data.length);
            return Array.isArray(data)
            ? data.map((element)=>new this.model(element))
            :new this.model(doc) 
        }
    //otherwise, issue the query and store the result in redis
    console.log("NOT GIVING CACHED VALUES ");
    const result = await exec.apply(this,arguments);
    client.hset(this.hashKey,key,JSON.stringify(result))
    return result;
} 

module.exports = {
    clearHash(hashKey){
        client.del(JSON.stringify(hashKey)); 
    }
}