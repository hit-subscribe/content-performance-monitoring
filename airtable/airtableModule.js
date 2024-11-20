// Utility functions for working with Airtable

require('dotenv').config();
const Airtable = require('airtable');

const baseID = process.env.AIRTABLE_CURRENT_BASE;
const apiKey = process.env.AIRTABLE_API_KEY;

/**
 * Fetches all records from a specified Airtable table and extracts specified fields.
 *
 * @param {string} tableName - The name of the Airtable table to fetch records from.
 * @param {Array<string>} fields - An array of field names to extract from each record.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects containing record IDs and the specified fields.
 */
function fetchAllRecords(tableName, fields) {
  return new Promise((resolve, reject) => {
    const base = new Airtable({ apiKey }).base(baseID);
    const recordsData = [];

    base(tableName)
      .select({})
      .eachPage(
        (records, fetchNextPage) => {
          records.forEach((record) => {
            const recordData = { id: record.id };
            fields.forEach((field) => {
              recordData[field] = record.get(field);
            });
            recordsData.push(recordData);
          });
          fetchNextPage();
        },
        (err) => {
          if (err) {
            console.error(
              `Error fetching records from table "${tableName}": ${err.message}`
            );
            reject(err);
          } else {
            resolve(recordsData);
          }
        }
      );
  });
}

/**
 * Creates a record in a specified Airtable table with the provided fields.
 *
 * @param {string} tableName - The name of the Airtable table to create the record in.
 * @param {Object} fields - An object containing the fields and their values for the new record.
 * @param {Function} [validateFields] - An optional validation function to preprocess and validate fields.
 * @returns {Promise<Object>} A promise that resolves to the created record.
 */
async function createRecord(tableName, fields, validateFields) {
  return new Promise((resolve, reject) => {
    const base = new Airtable({ apiKey }).base(baseID);

    try {
      if (validateFields) {
        validateFields(fields);
      }

      base(tableName).create([{ fields }], (err, records) => {
        if (err) {
          console.error(
            `Error creating record in table "${tableName}" with fields ${JSON.stringify(
              fields
            )}: ${err.message}`
          );
          reject(err);
        } else {
          resolve(records[0]);
        }
      });
    } catch (error) {
      console.error(
        `Unexpected error during record creation in table "${tableName}": ${error.message}`
      );
      reject(error);
    }
  });
}

/**
 * Links records in Airtable by updating a specified field in a table with a list of record IDs.
 *
 * @param {string} tableName - The name of the Airtable table where the record to be updated resides.
 * @param {string} recordId - The ID of the record to update.
 * @param {string} linkField - The name of the field to update with linked record IDs.
 * @param {Array<string>} linkedRecordIds - An array of record IDs to link to the specified field.
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 */
async function linkRecords(tableName, recordId, linkField, linkedRecordIds) {
  const base = new Airtable({ apiKey }).base(baseID);

  try {
    await base(tableName).update(recordId, {
      [linkField]: linkedRecordIds,
    });
    console.log(
      `Successfully linked records ${linkedRecordIds} to "${linkField}" in table "${tableName}", record "${recordId}"`
    );
  } catch (error) {
    console.error(
      `Error linking records to "${linkField}" in table "${tableName}", record "${recordId}" with linked IDs ${JSON.stringify(
        linkedRecordIds
      )}: ${error.message}`
    );
  }
}

module.exports = { fetchAllRecords, createRecord, linkRecords };
