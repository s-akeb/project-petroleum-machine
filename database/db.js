const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Sakeb:Sajeb1@cluster0.jprfe.mongodb.net/?retryWrites=true&w=majority', (err, res) => {
  if (err) {
    console.log('Database connection error:', err)
  }
  else {
    console.log('Database Connected.')
  }
});
