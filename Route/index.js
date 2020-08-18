const mongoose = require('mongoose');
const prettybytes = require('pretty-bytes');
require('dotenv')
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const express = require('express');
const router = express.Router()



var users = require("../Schemas/UserSchema")

router.post("/log",async (req,res) => {
    const data = await users.create(req.body)
    res.send("Logged")
})

router.route("/datasum").get(function(req, res) {
   users.aggregate(
      [
          {
        $group: {
            _id: null,
           "TotalCount": {
              $sum:"$data"

            }
         }
        }
      ],
      function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result)
        }
      }
    );
  });

router.route("/countUsers").get(function(req, res) {
  users.count({}, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

router.get('/dataLog',async (req,res) => {
   var data = await users.find();
   res.send(data)
})

module.exports = router;