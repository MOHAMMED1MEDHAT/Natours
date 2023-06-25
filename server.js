require('dotenv').config({ path: './config.env' });

const mongoose = require('mongoose');
const app = require('./app');

//mongoose connection setup
mongoose
    .connect(process.env.ATLAS_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'Natours',
    })
    .then(() => {
        console.log('Connected to db');
    })
    .catch((err) => console.log('error occured' + err));

// console.log(process.env);

const port = process.env.PORT || 6000;
app.listen(port, () => {
    console.log(`App listening on prot:${port}`);
});
