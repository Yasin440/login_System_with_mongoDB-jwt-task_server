const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000

//****middleware****//
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vc5mr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("task");
        const userInfoCollection = database.collection('Nemesis-Consultants-LLP-usersInfo');
        const logInCollection = database.collection('users');

        // //get api for services with services
        app.get('/getAllUser_info/all', async (req, res) => {
            const result = await userInfoCollection.find().sort({ $natural: -1 }).toArray();
            res.send(result);
        })

        //register
        app.post('/users/register', async (req, res) => {
            try {
                const salt = await bcrypt.genSalt()
                const hashedPassword = await bcrypt.hash(req.body.password, salt)
                const user = { email: req.body.email, password: hashedPassword }
                const result = await logInCollection.insertOne(user);
                res.send(result)
                res.status(201).send()
            } catch {
                res.status(500).send()
            }
        })
        //login api
        app.post('/users/login', async (req, res) => {
            const users = await logInCollection.find({}).toArray();
            console.log(users);
            const found = users.find(user => user.email = req.body.email);
            if (found == 'undefined') {
                return res.status(400).send('Cannot find user');
            }
            try {
                if (await bcrypt.compare(req.body.password, found.password)) {
                    res.json({ message: 'Login Successful' })
                } else {
                    res.json({ error: 'Invalid email or password' })
                }
            } catch {
                res.status(500).send()
            }
        })


        // app.put('/clients', async (req, res) => {
        //     const client = req.body;
        //     const query = { email: client.email };
        //     const options = { upsert: true };
        //     const updateClient = { $set: client };
        //     const result = await clientsCollection.updateOne(query, updateClient, options);
        //     res.json(result);

        // })


        //POST API to add user through email and pass
        app.post('/addNewUser_info', async (req, res) => {
            const user = req.body;
            const result = await userInfoCollection.insertOne(user);
            res.json(result);
        })


        // //delete api to delete an order from all orders
        app.delete('/allUser/delete/:_id', async (req, res) => {
            const id = req.params._id;
            const query = { _id: ObjectId(id) };
            const result = await userInfoCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("This a Server to Connect 'Nemesis Consultants LLP's task' with backEnd");
})
app.listen(port, () => {
    console.log('Nemesis Consultants LLP task is running on:', port);
})