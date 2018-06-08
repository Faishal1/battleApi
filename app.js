var app = require("express")();
const csvFilePath = "files/battles.csv";
const csv = require("csvtojson");
const mongoose = require("mongoose");
const _ = require("lodash");



mongoose.connect("mongodb://localhost/test", function(err) {
  if (err) throw err;

  console.log("Successfully connected");
});

app.listen(3000);

console.log("App listening at port 3000");

var schema = new mongoose.Schema({
  name: String,
  year: Date,
  battle_number: Number,
  attacker_king: String,
  defender_king: String,
  attacker_1: String,
  attacker_2: String,
  attacker_3: String,
  attacker_4: String,
  defender_1: String,
  defender_2: String,
  defender_3: String,
  defender_4: String,
  attacker_outcome: String,
  battle_type: String,
  major_death: Number,
  major_capture: Number,
  attacker_size: Number,
  defender_size: Number,
  attacker_commander: String,
  defender_commander: String,
  summer: String,
  location: String,
  region: String,
  note: String
});

var battleSchema = mongoose.model("battleSchema", schema);

csv()
  .fromFile(csvFilePath)
  .then(jsonObj => {
    // console.log(jsonObj);
    // battleSchema.insertMany([jsonObj], function(err) {});
    // battleSchema.collection.insert(jsonObj, function (err,created){
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         console.dir(created);
    //     }
    // })
    //   res.send(jsonObj);
  });

const jsonArray = csv().fromFile(csvFilePath);

battleSchema.find({ attacker_1: "Baratheon" }, function(err, found) {
  if (err) {
    console.log(err);
  } else {
    // console.dir(found);
  }
});

app.get("/list", function(req, res) {
  battleSchema.find({}, "name").exec(function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log(doc);
      // res.setHeader("Content-Type", "application/json");
      res.send({ namesOfBattles: doc });
      // res.end("doc has",doc);
    }
  });
});

app.get("/count", function(req, res) {
  battleSchema.find({}).exec(function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      var noOfBattles = _.sumBy(doc, "battle_number");
      console.log(doc);
      // res.setHeader("Content-Type", "application/json");
      res.send({ noOfBattles: noOfBattles });
      // res.end("doc has",doc);
    }
  });
});

app.get("/stats", function(req, res) {
  battleSchema.find({}).exec(function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      var finalObj = {
        most_active: {},
        attacker_outcome: {},
        battle_type: [],
        defender_size: {}
      };
      // finalObj.most_active.attacker_king=(_.groupBy(doc,'attacker_king'));

      // var obj = _(doc).groupBy('attacker_king').values().map(
      //     (group) => ({attacker_king:group[0].attacker_king, qty: group.length})
      //   );
      //   console.log(obj[0]);

      finalObj.most_active.attacker_king = _.countBy(doc, "attacker_king");

      finalObj.attacker_outcome = _(doc).countBy("attacker_outcome");
      finalObj.battle_type = _.countBy(doc, "battle_type");
      finalObj.defender_size.min = _.min(doc);
      finalObj.defender_size.max = _.max(doc);
      res.send(finalObj);
    }
  });
});

app.get("/search", function(req, res) {
  var params = req.query;
  var searchObj = {
    attacker_king: params.king,
    defender_king: params.king,
    
  };
  var otherObj={
    location: params.location,
    battle_type: params.type
  }
  console.log(params);
  battleSchema
    .find({
      $and:
       [{ $or: [searchObj] }]
       
    })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.send(doc);
      }
    });
});
