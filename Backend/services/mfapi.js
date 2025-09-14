const axios = require('axios');

const MF_BASE = 'https://api.mfapi.in';

async function fetchFundList() {
  const { data } = await axios.get(`${MF_BASE}/mf`);
  // mfapi returns an array of objects: {schemeName, schemeCode, ...}
  return data;
}

async function fetchFundHistory(schemeCode) {
  const { data } = await axios.get(`${MF_BASE}/mf/${schemeCode}`);
  // data: {meta: {...}, data: [{nav: "12.34", date: "09-09-2025"}, ...]}
  return data;
}

async function fetchFundLatest(schemeCode) {
  const { data } = await axios.get(`${MF_BASE}/mf/${schemeCode}/latest`);
  // data: {meta: {...}, data: {nav: "12.34", date: "09-09-2025"}}
  return data;
}

module.exports = { fetchFundList, fetchFundHistory, fetchFundLatest };
