const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const weatherRoutes = require('./routes/current_weather');

const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/current', weatherRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});