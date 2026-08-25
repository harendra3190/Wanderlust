require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
  accessToken: process.env.MAP_TOKEN,
});

async function main() {
  // Connect to MongoDB Atlas
  await mongoose.connect(process.env.ATLASDB_URL);

  console.log("Connected to MongoDB Atlas");

  await initDB();

  await mongoose.connection.close();

  console.log("Database connection closed");
}

const initDB = async () => {
  // Delete old listings
  await Listing.deleteMany({});
  console.log("Old listings deleted");

  const listings = [];

  for (let obj of initData.data) {
    console.log(`Finding coordinates for: ${obj.location}, ${obj.country}`);

    const response = await geocodingClient
      .forwardGeocode({
        query: `${obj.location}, ${obj.country}`,
        limit: 1,
      })
      .send();

    if (!response.body.features.length) {
      console.log(`❌ Location not found: ${obj.location}, ${obj.country}`);
      continue;
    }

    // Mapbox returns GeoJSON coordinates as [longitude, latitude]
    const geometry = response.body.features[0].geometry;

    const listing = {
      ...obj,

      owner: "6a88972509250fb097bc13b3",

      geometry: geometry,

      category: getCategory(obj),
    };

    listings.push(listing);

    console.log(
      `✅ ${obj.location}: [${geometry.coordinates[0]}, ${geometry.coordinates[1]}]`
    );
  }

  await Listing.insertMany(listings);

  console.log(`\n🎉 ${listings.length} listings were initialized successfully!`);
};


// Assign a category to each listing
function getCategory(obj) {
  const text = `${obj.title} ${obj.description} ${obj.location}`.toLowerCase();

  if (
    text.includes("beach") ||
    text.includes("beachfront") ||
    text.includes("island") ||
    text.includes("malibu") ||
    text.includes("cancun") ||
    text.includes("bali") ||
    text.includes("phuket") ||
    text.includes("maldives") ||
    text.includes("greece") ||
    text.includes("mykonos")
  ) {
    return "Beach";
  }

  if (
    text.includes("mountain") ||
    text.includes("ski") ||
    text.includes("chalet") ||
    text.includes("aspen") ||
    text.includes("banff") ||
    text.includes("alps") ||
    text.includes("montana") ||
    text.includes("lake tahoe")
  ) {
    return "Mountain";
  }

  if (
    text.includes("desert") ||
    text.includes("dubai")
  ) {
    return "Desert";
  }

  if (
    text.includes("treehouse") ||
    text.includes("forest") ||
    text.includes("cabin")
  ) {
    return "Forest";
  }

  if (
    text.includes("cottage") ||
    text.includes("villa") ||
    text.includes("farm") ||
    text.includes("countryside")
  ) {
    return "Countryside";
  }

  return "City";
}


main()
  .then(() => {
    console.log("Initialization completed");
  })
  .catch((err) => {
    console.log("Initialization failed:");
    console.log(err);
  });