const express = require('express')
const app = express();


const labelLog = {};
const intervalLog = {};
let id;

const tracker = (label, countA) => {
  labelLog[label] = countA
}

const intervalTracker = (label, id) => {
  intervalLog[label] = id
}


const timer = (label, countVal) => {
  let count = countVal;
  id = setInterval(()=> {
    count--;
    tracker(label, count)
     if (count < 1) {
       count = countVal
  };
},1000)
  intervalTracker(label, id)
}


const stopper = (label) => {
  clearInterval(intervalLog[label])
  signal = 0
}

app.get('/start/:label/:val', (req,res)=> {

  // Note: Cycle through the intervalLog to make sure the same name isn't already in use, note to use reset
  let newLabel = req.params.label;
  let startVal = req.params.val

  timer(newLabel, startVal)
  res.send(`${newLabel} timer started`);
})

app.get('/stop/:stopLabel', (req,res)=> {
  let label = req.params.stopLabel ;
  stopper(label)
  res.send('timer stopped');
})


app.get(`/currentTime/:label`, (req,res)=> {

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  let labelRequest = req.params.label;


/*if (signal === 0) {
  res.write('this timer is inactive')
  res.end()
} else {*/
    let y = setInterval(()=> {
      res.write(`${JSON.stringify(labelLog[labelRequest])}\n\n`);
    },1000)
  //}
})
app.listen(3000)
