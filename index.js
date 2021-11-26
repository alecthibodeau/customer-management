// Import CSV file from command line: node index.js <file_name>
const csvFile = process.argv[2];

// Modules
const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');

// Invoking csv returns a promise
csv()
  .fromFile(`./${csvFile}`)
  .then((json) => {
    json.forEach(record => {
      console.log(record['First Name']);
      console.log(record['ZIP Code']);
    })
  }
);

const customersArray = ['a', 'b', 'c']

for (let i = 0; i < customersArray.length; i++) {
  fs.mkdir(path.join(__dirname, customersArray[i]), (err) => {
    if (err) {
        if (err.errno === -17 && err.code === 'EEXIST') {
          return console.error(`'${customersArray[i]}' directory already exists.`);
        }
        return console.error(err);
    }
    console.log(`'${customersArray[i]}' directory successfully created.`);
  });
};