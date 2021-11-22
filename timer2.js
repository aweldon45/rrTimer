const express = require('express')
const app = express();

let count = 15
const timer = () => {
  let x = setInterval(()=> {
    count--;
     if (count<1) {
    clearInterval(x)
  };
},1000)}

app.get('/start', (req,res)=> {
  timer();
  res.send('timer started');
})

app.get('/reset', (req,res)=> {
  count = 30 ;
  res.send('timer reset');
})


app.get('/', (req,res)=> {

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  let y = setInterval(()=> {
    res.write(`${JSON.stringify(count)}\n\n`);
  },1000)
})
app.listen(3000)
