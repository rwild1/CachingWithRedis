// import packages
import express from 'express';
import axios from 'axios';
import redis from 'redis';

// creates an express application
const app = express();

// connect application to redis server running on port 6379
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

// log error to the console if any occurs
client.on('error', (err) => {
    console.log(err);
});

// routes http get request to get data from url and send them back to the client
app.get('/getCountry', (req, res) => {
    // we get the users input with the request's query parameters
    const userinput = req.query.country;
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${userinput}`;

    // retrieve the requested data from the cache by passing the users input
    return client.get(`country:${userinput}`, (err, result) => {
        if (err) throw err;

        if (result) {
            const output = JSON.parse(result);
            return res.status(200).json(output);
        } else {
            return axios.get(url)
                .then(response => {
                    const output = response.data;
                    client.setex(`country:${userinput}`, 3600, JSON.stringify({source:'Redis Cache', output}));
                    return res.status(200).json({source:'API', output});
                })
                .catch (err => {
                    return res.send(err);
                })
        }
    });
});

// listen for connection on the specified port
app.listen(process.env.PORT || 3000, () => {
    console.log(`Serving running on port ${port}`);
})