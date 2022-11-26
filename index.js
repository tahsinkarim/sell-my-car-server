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
        const usersCollection = client.db('sellMyCar').collection('users')
        const ordersCollection = client.db('sellMyCar').collection('orders')
        const reportsCollection = client.db('sellMyCar').collection('reports')

        //Read all Category
        app.get('/category', async (req, res)=> {
            const query = {}
            const cursor = categoryCollection.find(query)
            const category = await cursor.toArray()
            res.send(category)
        })

        // Get cars by seller email
        app.get('/myCars', async (req, res)=> {
            const email = req.query.email
            const query = {sellerEmail: email}
            const cursor = availableCarsCollection.find(query)
            const availableCars = await cursor.toArray()
            res.send(availableCars)
        })
        // Update Seller info
        app.put('/myCars/:id', async (req, res)=> {
            const id = req.params.id
            const query = { _id: ObjectId(id)};
            const data = req.body
            const option = {upsert : true}
            const updatedData = {
                $set: {...data}
            }
            const result = await availableCarsCollection.updateOne(query, updatedData, option)
            res.send(result)
        })

        //Delete Seller Car
        app.delete('/myCars/:id', async (req, res)=> {
            const id = req.params.id
            const query = { _id: ObjectId(id)};
            const result = await availableCarsCollection.deleteOne(query)
            res.send(result)
        })


        //Read all available cars
        app.get('/availableCars', async (req, res)=> {
            const query = { available: true}
            const cursor = availableCarsCollection.find(query)
            const availableCars = await cursor.toArray()
            res.send(availableCars)
        })

        //Add New Available Car
        app.post('/availableCars', async (req,res)=> {
            const newCar = req.body
            const result = await availableCarsCollection.insertOne(newCar)
            res.send(result)
        })

        //Read cars by category id
         app.get('/category/:id', async (req, res)=> {
            const id = req.params.id
            const query = { available: true, categoryId: id}
            const cursor = availableCarsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //Add a order
        app.post('/orders', async (req, res)=>{
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })

        //Get Orders by Email
        app.get('/orders', async (req, res)=>{
            const email = req.query.email
            const query = {email: email}
            const result = await ordersCollection.find(query).toArray()
            res.send(result)
        })

        //Delete From My Orders
        app.delete('/orders/:id', async (req,res)=>{
            const id = req.params.id 
            const query = {_id: ObjectId(id)}
            const result = await ordersCollection.deleteOne(query)
            res.send(result)
        })

        //Add user on sign up
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        //Get users info by email by seller
        app.get('/users', async (req, res)=>{
            const userEmail = req.query.email
            const query = {email : userEmail}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        //Delete User By Admin
        app.delete('/users/:email', async (req, res)=>{
            const email = req.params.email
            const query = { email: email}
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        
        //Get all Buyers
        app.get('/users/buyers', async (req, res)=>{
            const query = {role: 'buyer'}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        //Get all Sellers
        app.get('/users/sellers', async (req, res)=>{
            const query = {role: 'seller'}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        //Update Sellers
        app.put('/users/sellers/:email', async (req, res)=> {
            const email = req.params.email
            const query = { email: email};
            const carsQuery = {sellerEmail: email}
            const data = req.body
            const option = {upsert : true}
            const updatedData = {
                $set: {...data}
            }
            const result = await usersCollection.updateOne(query, updatedData, option)
            const carsCollection = await availableCarsCollection.updateMany(carsQuery, updatedData)
            res.send({result, carsCollection})
        })

        //Report to admin
        app.post('/reports', async (req, res) => {
            const report = req.body
            const query = {carId: report.carId, user: report.user}
            //Check if user already Reported this item
            const alreadyReported = await reportsCollection.find(query).toArray()
            if(alreadyReported.length){
                const message = `You already reported this item`
                return res.send ({acknowledged: false, message})
            }
            const result = await reportsCollection.insertOne(report)
            res.send(result)
        })

        //Get Reported Items
        app.get('/reports', async (req,res)=>{
            const query = {}
            const reports = await reportsCollection.find(query).toArray()
            res.send(reports)
        })

         //Delete reported Items by admin
         app.delete('/reports/:id', async (req, res)=> {
            const id = req.params.id
            const carQuery = { _id: ObjectId(id)};
            const reportQuery = {carId: id}
            const deleteReport = await reportsCollection.deleteOne(reportQuery)
            const result = await availableCarsCollection.deleteOne(carQuery)
            res.send({deleteReport, result})
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