#!/usr/bin/env node
/**
 * fetch-google-reviews.js
 *
 * Fetches the latest Google Business reviews via the Places API
 * and writes a static JSON file that the front-end widget consumes.
 *
 * Required env vars (set as GitHub Secrets):
 *   GOOGLE_PLACES_API_KEY  - restricted server-side API key
 *   GOOGLE_PLACE_ID        - the Place ID for the business listing
 *
 * Output: data/google-reviews.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

if (!API_KEY || !PLACE_ID) {
  console.error('Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID environment variable.');
  process.exit(1);
}

const fields = [
  'name',
  'place_id',
  'formatted_address',
  'rating',
  'user_ratings_total',
  'url',
  'reviews',
].join(',');

const url =
  `https://maps.googleapis.com/maps/api/place/details/json` +
  `?place_id=${encodeURIComponent(PLACE_ID)}` +
  `&fields=${encodeURIComponent(fields)}` +
  `&key=${encodeURIComponent(API_KEY)}` +
  `&reviews_sort=newest`;

function fetchJSON(requestUrl) {
  return new Promise((resolve, reject) => {
    https
      .get(requestUrl, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch (err) {
            reject(new Error('Failed to parse Places API response.'));
          }
        });
      })
      .on('error', reject);
  });
}

(async () => {
  try {
    console.log('Fetching Google Business details...');
    const data = await fetchJSON(url);

    if (data.status !== 'OK' || !data.result) {
      console.error('Places API error:', data.status, data.error_message || '');
      process.exit(1);
    }

    const place = data.result;

    // Strip potentially sensitive fields and keep only what the widget needs
    const output = {
      place: {
        name: place.name || '',
        place_id: place.place_id || PLACE_ID,
        formatted_address: place.formatted_address || '',
        rating: typeof place.rating === 'number' ? place.rating : null,
        user_ratings_total:
          typeof place.user_ratings_total === 'number' ? place.user_ratings_total : null,
        url: place.url || '',
        reviews: (place.reviews || []).map((r) => ({
          author_name: r.author_name || 'Google customer',
          rating: r.rating,
          text: r.text || '',
          relative_time_description: r.relative_time_description || '',
          time: r.time,
        })),
      },
      fetched_at: new Date().toISOString(),
    };

    const outDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outFile = path.join(outDir, 'google-reviews.json');
    fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf8');

    console.log(
      `Wrote ${outFile} - rating ${output.place.rating}, ${(output.place.reviews || []).length} reviews.`
    );
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
