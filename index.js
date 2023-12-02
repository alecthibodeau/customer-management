/**
 * Load the CSV file from the command line with three arguments after node:
 * 1) JS file
 * 2) CSV file [see LibreOffice notes about prepping this]
 * 3) current item (in quotes)
 * $node index.js <file_name.csv> 'LC24'
 * Dates in CSV can be formatted as two-character or four-character sections: MM/DD/YY or MM/DD/YYYY
 */

/* Modules to import */
import csv from 'csvtojson';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs';
import path, { join } from 'path';

const fileNamePath = fileURLToPath(import.meta.url); // The path to the current file: i.e. index.js
const parentDirectoryPath = path.dirname(fileNamePath); // The path to the parent directory for the current file
const csvFilePath = `./${process.argv[2]}`;
const currentItem = process.argv[3];

let orderBlockDate = '';
let dailyOrderPosition = 0;
let namesOfDirectories = [];

const addLeadingZeroCharacters = (positionNumber) => {
  let indexCharacters = positionNumber.toString();
  for (let i = 0; i < 4 - indexCharacters.length; i++) {
    indexCharacters = '0' + indexCharacters;
  }
  return indexCharacters;
}

const makeDirectoryNameText = (json) => {
  json.forEach(record => {
    const orderYear = `20${record.Date.slice(-2)}`;
    const orderMonthAndDay = record.Date.replace('/', '').substring(0,4);
    const datePrefix = `${orderMonthAndDay}-${orderYear}-`;
    let quantity = 1;
    let quantityNotation = '';
    let otherItems = '';
    if (record.Quantity > 1) {
      quantity = record.Quantity;
      quantityNotation = `x${quantity}`;
    }
    if (record['Other Items']) {
      otherItems = `+${record['Other Items']}`;
    }
    if (orderMonthAndDay !== orderBlockDate) {
      dailyOrderPosition = 0;
      orderBlockDate = orderMonthAndDay;
    }
    dailyOrderPosition++;
    const dailyOrderIndex = addLeadingZeroCharacters(dailyOrderPosition);
    const basicOrderInfo = `${datePrefix}${dailyOrderIndex}${currentItem}${quantityNotation}`;
    const directoryNameText = `${basicOrderInfo}${otherItems} ${record.Customer}`;
    namesOfDirectories.push(directoryNameText);
  })
}

const generateDirectories = () => {
  for (let i = 0; i < namesOfDirectories.length; i++) {
    const currentDirectoryName = namesOfDirectories[i];
    const fileExistsErrorNumber = -17;
    const fileExistsErrorCode = 'EEXIST';
    mkdir(join(parentDirectoryPath, currentDirectoryName), (err) => {
      if (err) {
        if (err.errno === fileExistsErrorNumber && err.code === fileExistsErrorCode) {
          return console.error(`'${currentDirectoryName}' directory already exists.`);
        }
        return console.error(err);
      }
      console.log(`'${currentDirectoryName}' directory successfully created.`);
    })
  }
}

/* Invoking csv returns a Promise */
const getCsvData = (filePath) => {
  csv()
    .fromFile(filePath)
    .then((json) => { makeDirectoryNameText(json) })
    .then(() => { generateDirectories() })
    .catch((error) => console.error(error));
}

getCsvData(csvFilePath);
