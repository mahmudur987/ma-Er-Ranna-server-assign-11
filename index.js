const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const port = process.env.PORT
// middlewere
app.use(cors());
app.use(express.json());

// json web token verification
const verifyjwt = (req, res, next) => {
    const authHead = req.headers.authorization;
    if (!authHead) {
        return res.status(401).send({ message: 'in authorized access' })
    }

    const token = authHead.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            res.status(401).send({ message: 'in authorized access' })
        }
        req.decoded = decoded;
    })
    // console.log(token)
    next();

}





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


        // json web token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
            res.send({ token });
        })




        app.get('/dishes', async (req, res) => {
            const query = {};
            const dishes = await dishesCollection.find(query).sort({ date: - 1 }).limit(3).toArray();
            res.send(dishes)
        });
        app.get('/alldishes', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const dishes = await dishesCollection.find(query).sort({ date: -1 }).skip(page * size).limit(size).toArray();
            const count = await dishesCollection.estimatedDocumentCount()
            res.send({ dishes, count })
        });
        app.post('/dish', async (req, res) => {
            const newdish = req.body;
            newdish.date = new Date(Date.now());
            console.log(newdish)
            const result = await dishesCollection.insertOne(newdish);
            res.send(result)
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
        app.get('/myreviews', verifyjwt, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(401).send({ massege: 'aunauthorized' })

            }
            console.log(decoded)
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