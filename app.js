const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });


app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListing=(req,res,next)=>{
  let{error} = listingSchema.validate(req.body);
  if(error){
     let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
}

// index routing
app.get("/listings",wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));
// new route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
// show route
app.get("/listings/:id",wrapAsync (async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

// create route
app.post("/listings", validateListing,wrapAsync (async (req, res,next) => {
  let result=listingSchema.validate(req.body);
  console.log(result);
  if(result.error){
    throw new ExpressError(400,result.error);
  }
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
  
 
  
}));
// Edit route
app.get("/listings/:id/edit",wrapAsync (async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));
// update route
app.put("/listings/:id",validateListing,wrapAsync( async (req, res) => {
  
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//delete

app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListings = await Listing.findByIdAndDelete(id);
  console.log(deletedListings);
  res.redirect("/listings");
}));

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
  let { statusCode=500, message="Something went wrong" } = err;

  res.status(statusCode).render("error.ejs",{ message});
});

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
