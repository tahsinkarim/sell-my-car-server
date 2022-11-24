const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.k6fgqcn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//async await
async function run(){
    try{
        const categoryCollection = client.db('sellMyCar').collection('category')
        const availableCarsCollection = client.db('sellMyCar').collection('availableCars')

        //Read all Category
        app.get('/category', async (req, res)=> {
            const query = {}
            const cursor = categoryCollection.find(query)
            const category = await cursor.toArray()
            res.send(category)
        })

        //Read all available cars
        app.get('/availableCars', async (req, res)=> {
            const query = { available: true}
            const cursor = availableCarsCollection.find(query)
            const availableCars = await cursor.toArray()
            res.send(availableCars)
        })

        //Read cars by category id
         app.get('/category/:id', async (req, res)=> {
            const id = req.params.id
            const query = { available: true, categoryId: id}
            const cursor = availableCarsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

    } 
    finally {

    }

}
run().catch(err => console.log(err))

app.get('/', (req, res)=>{
    res.send('Simple Node Server Running')
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})