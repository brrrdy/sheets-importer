//const fs = require('fs');
//const readline = require('readline');
//const {google} = require('googleapis');

import * as fs from 'fs';
import * as readline from 'readline';
import google = require('googleapis');
const sheets = google.google.sheets('v4');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content.toString()), getFlavourText);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the flavor text from each sheet in the range
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function getFlavourText(auth) {
  //const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.batchGet({
    spreadsheetId: '10jSMRIG9nwRppaXE7Hi8VHVRZe8Cd3p2mBN7ZdfJ_RQ',
    ranges: [
      'Distinctions!A2:C',
      'Passions!A2:C',
      'Adversities!A2:C',
      'Anxieties!A2:C'
      ],
    auth: auth
    }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const sheetGetResults = res.data.valueRanges;

    for (const sheeter of sheetGetResults) {
      if (sheeter.values.length) {
        for (const vals of sheeter.values) {
          console.log(`=======================`);
          console.log(`${vals[0]}`);
          console.log(`---`);
          console.log(`${vals[1]}`);    
        }
      } else {
        console.log('No data found.');
      }
    } 
  });
}