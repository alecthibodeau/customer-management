/**
 * Import CSV file from command line with multiple arguments:
 * $node index.js <file_name.csv> 'LC22'
 * Dates in CSV should be formatted as two-character sections: MM/DD/YY
 */

const csvFile = process.argv[2];
const currentItem = process.argv[3];

/**
 * Modules
 */

const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');

let orderBlockDate = '';
let dailyOrderPosition = 0;
let namesOfDirectories = [];

const csvFilePath = `./${csvFile}`;

const leadingZeroAddition = (number) => {
  for (let i = 0; i < 4 - number.toString().length; i++) {
    number = '0' + number;
  }
  return number;
};

const makeDirectoryNameText = (json) => {
  json.forEach(record => {
    const orderYear = `20${record['Date'].slice(-2)}`;
    const orderMonthAndDay = record['Date'].replace('/', '').substring(0,4);
    const datePrefix = `${orderMonthAndDay}-${orderYear}-`;
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
    })
  }
};

/**
 * Invoking csv returns a Promise
 */

const getCsvData = (path) => {
  csv()
    .fromFile(path)
    .then((json) => { makeDirectoryNameText(json) })
    .then(() => { generateDirectories() })
    .catch(() => console.error(`Something went wrong. Check if '${path}' is the correct file path.`));
}

getCsvData(csvFilePath);

