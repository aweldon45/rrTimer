const express = require('express')
const app = express();


const labelLog = {};

const tracker = (label, countA) => {
  labelLog[label] = countA
}


const timer = (label, countVal) => {
  let count = countVal;
  let x = setInterval(()=> {
    count--;
    tracker(label, count)
     if (count < 1) {
       count = countVal
    return
  };
},1000)}

app.get('/start/:label/:val', (req,res)=> {

  let newLabel = req.params.label;
  let startVal = req.params.val

  timer(newLabel, startVal)
  res.send(`${newLabel} timer started`);
})

app.get('/reset/:resetVal', (req,res)=> {
  let count = req.params.resetVal ;
  res.send('timer reset');
})


app.get(`/currentTime/:label`, (req,res)=> {

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  let labelRequest = req.params.label;

  let y = setInterval(()=> {
    res.write(`${JSON.stringify(labelLog[labelRequest])}\n\n`);
  },1000)
})
app.listen(3000)
