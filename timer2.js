const AWS = require('aws-sdk');
const express = require('express')
const app = express();


//const AWS_ACCESS_KEY_ID = ""
//const AWS_SECRET_ACCESS_KEY = ""
AWS.config.update({
  region: "us-east-1",
  //accessKeyId: AWS_ACCESS_KEY_ID,
  //secretAccessKey: AWS_SECRET_ACCESS_KEY,
})


const labelLog = {};
const intervalLog = {};
let id;

const messageMaker = async (label) => {

  let params = {
    Message: label,
    TopicArn: 'arn:aws:sns:us-east-1:680623495322:RepReserveExpire'
  }

  const messenger = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

  const messageRep = await messenger.then((data)=>{
    console.log(data)
  }).catch((err)=> {
    console.log(err)
  })
  return messageRep
}

//tracks labels
const tracker = (label, countA) => {
  labelLog[label] = countA
}

//tracks intervals
const intervalTracker = (label, id) => {
  intervalLog[label] = id
}

//creates timer
const timer = (label, countVal) => {
  let count = countVal;

  id = setInterval(()=> {
    count--;
    tracker(label, count)
     if (count < 1) {
       messageMaker(label);
       clearInterval(id)
  };
},1000)
  intervalTracker(label, id)
}

//stops timer
const stopper = (label) => {
  clearInterval(intervalLog[label])
  labelLog[label] = 'timer inactive';
}

//reset timer
const resetter = (label, countB) => {
  stopper(label);
  timer(label, countB);
}

//grabs timers
const intervalList = () => {
  let intervals = Object.keys(intervalLog)
  return intervals
}

// start timer command
app.get('/start/:label/:val', (req,res)=> {


  let newLabel = req.params.label;
  let startVal = req.params.val;
  let response = `${newLabel} timer started`
  let count = 0

  let nameHolder = Object.keys(intervalLog)
  for (let i=0;i<nameHolder.length;i++) {
    if (nameHolder[i] === newLabel) {
      count = 1
      response = 'this timer already exists, to reset it please use the reset command';
      break;
    } else {
      response = `${newLabel} timer started`;
    }
  }

  if (count < 1) {
    timer(newLabel, startVal)
  }

  res.send(response);
})

//stop timer command
app.get('/stop/:stopLabel', (req,res)=> {
  let label = req.params.stopLabel ;
  stopper(label)
  res.send('timer stopped');
})

//reset command
app.get('/reset/:label/:val', (req, res) => {
  let label = req.params.label;
  let resetVal = req.params.val;

  resetter(label, resetVal);
  res.send(`${label} reset to start at ${resetVal}`)

})

//get all timers
app.get('/listTimers', (req, res)=> {
  let timers = intervalList()
  res.send(`${JSON.stringify(timers)}\n\n`)
})

//get current time command
app.get(`/currentTime/:label`, (req,res)=> {

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  let labelRequest = req.params.label;
    let y = setInterval(()=> {
      res.write(`data: ${JSON.stringify(labelLog[labelRequest])}\n\n`);
    },1000)
})
app.listen(3000)
