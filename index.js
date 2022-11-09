const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT
// middlewere
app.use(cors());
app.use(express.json());

// mongodb Connection
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.ddhlldi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// Mongodb CURD operation
async function run() {
    try {
        const database = client.db('MaErRanna');
        const dishesCollection = database.collection('dishes');
        const reviewsCollection = database.collection('reviews');
        const feturesCollection = database.collection('features');
        const characterCollection = database.collection('character');
        app.get('/dishes', async (req, res) => {
            const query = {};
            const dishes = await dishesCollection.find(query).limit(3).toArray();
            res.send(dishes)
        });
        app.get('/alldishes', async (req, res) => {
            const query = {};
            const dishes = await dishesCollection.find(query).toArray();
            res.send(dishes)
        });
        app.get('/dishes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const dish = await dishesCollection.findOne(query);
            res.send(dish)
        });
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            review.date = new Date(Date.now());
            // console.log(review)
            const result = await reviewsCollection.insertOne(review);
            res.send(result)
        });
        app.get('/reviews', async (req, res) => {
            const foodName = req.query.foodname;
            const filter = { foodname: foodName };
            const reviews = await reviewsCollection.find(filter).sort({ date: -1 }).toArray();
            res.send(reviews)
        });
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const comment = req.body.comment;
            const updateDoc = {
                $set: {
                    comment: comment,
                    date: new Date(Date.now())
                },
            };
            // console.log(updateDoc)
            const result = await reviewsCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        });
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;;
            const filter = { _id: ObjectId(id) };
            console.log(filter)
            const result = await reviewsCollection.deleteOne(filter);
            res.send(result)
        })
        app.get('/myreviews', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const reviews = await reviewsCollection.find(filter).sort({ date: -1 }).toArray();
            res.send(reviews)
        });
        app.get('/features', async (req, res) => {
            const query = {};
            const features = await feturesCollection.find(query).toArray();
            res.send(features)
        });
        app.get('/characters', async (req, res) => {
            const query = {};
            const features = await characterCollection.find(query).toArray();
            res.send(features)
        });

    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('helow world')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})