const  express = require('express')
const app = express()
const port = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('Life is on my way'))
app.listen(port, () => console.log(`My listening on port ${port}!`))