// Import CSV file from command line: node index.js <file_name.csv>
const csvFile = process.argv[2];

// Modules
const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');

const currentItem = 'LC22';
const currentYear = 2021;
let orderBlockDate = '';
let dailyOrderPosition = 0;
let namesOfDirectories = [];

const leadingZeroAddition = (number) => {
  for (let i = 0; i < 4 - number.toString().length; i++) {
    number = '0' + number;
  }
  return number;
}

const makeDirectoryNameText = (json) => {
  json.forEach(record => {
    let quantity = 1;
    let quantityNotation = '';
    let other = '';
    if (record['Quantity'] > 1) {
      quantity = record['Quantity'];
      quantityNotation = `x${quantity}`;
    }
    if (record['Other Items']) {
      other = `+${record['Other Items']}`;
    }
    const datePrefix = record['Date']
      .replace('/', '')
      .replace(`/${currentYear.toString()
      .substring(2,4)}`, '')+`-${currentYear}-`;
    const orderMonthAndDay = datePrefix.substring(0,4);
    if (orderMonthAndDay !== orderBlockDate) {
      dailyOrderPosition = 0;
      orderBlockDate = orderMonthAndDay;
    }
    dailyOrderPosition++;
    const dailyOrderIndex = leadingZeroAddition(dailyOrderPosition);
    const basicOrderInfo = `${datePrefix}${dailyOrderIndex}${currentItem}${quantityNotation}`;
    const directoryNameText = `${basicOrderInfo}${other} ${record.Customer}`;
    namesOfDirectories.push(directoryNameText);
  })
};

const generateDirectories = () => {
  for (let i = 0; i < namesOfDirectories.length; i++) {
    fs.mkdir(path.join(__dirname, namesOfDirectories[i]), (err) => {
      if (err) {
        if (err.errno === -17 && err.code === 'EEXIST') {
          return console.error(`'${namesOfDirectories[i]}' directory already exists.`);
        }
        return console.error(err);
      }
      console.log(`'${namesOfDirectories[i]}' directory successfully created.`);
    });
  };
}

// Invoking csv returns a promise
csv()
  .fromFile(`./${csvFile}`)
  .then((json) => { makeDirectoryNameText(json) })
  .then(() => { generateDirectories() });
