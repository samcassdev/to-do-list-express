const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = "mongodb+srv://samcasseusdev:to-do-list@to-do-list-tlhvg.mongodb.net/test?retryWrites=true";
const dbName = "to-do-list";

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  //console.log(db)
  db.collection('todos').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})

app.get('/notes', (req, res) => {
  //console.log(db)
  //db.collection gives us access to the collection todos on the database
  // .find() finds the things in our collection
  // .toArray turns them into arrays
  db.collection('todos').find().toArray((err, result) => {
    // error handler
    if (err) return console.log(err)
    console.log(result)
    res.render('notes.ejs',  // the file we want to render
    // pass data into those files
    {notes: result, random: 1738, status: 'happy', location: 'boston'})
  })
})

app.get('/createnote', (req, res) => {
  //console.log(db)
  db.collection('todos').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('createnote.ejs', {todos: result})
  })
})

app.post('/messages', (req, res) => {
  db.collection('todos').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

// path must match action of form
//
app.post('/notes', (req, res) => {
  console.log(req.body.author)
  console.log(req.body.topic)
  console.log(req.body.note)

  let newNote = {
    author: req.body.author,
    topic: req.body.topic,
    note: req.body.note
  }

  db.collection('todos').save(newNote, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/notes')
  })
})

app.put('/messages', (req, res) => {
  db.collection('todos')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('todos').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
