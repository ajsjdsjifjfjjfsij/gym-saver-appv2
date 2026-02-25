require('dotenv').config({ path: '.env.local' });
async function main() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
      },
      body: JSON.stringify({textQuery: "Jetts Fitness Lichfield"})
  });
  const data = await res.json();
  console.log(data);
}
main();
