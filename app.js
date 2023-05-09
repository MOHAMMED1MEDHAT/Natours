const express = require('express');
const app = express();

const port = process.env.PORT || 6000;

app.listen(port, () => {
    console.log(`App listening on prot:${port}`);
});
