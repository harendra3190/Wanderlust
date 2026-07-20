const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview} = require("../midddleware.js");





//reviews 
router.post("/",validateReview,wrapAsync(async (req, res) => {
     let listing = await Listing.findById(req.params.id);
     let newReview = new Review(req.body.review);
     listing.reviews.push(newReview);
     await newReview.save();
     await listing.save();
     req.flash("success", "Successfully added a new review!");
     res.redirect(`/listings/${listing._id}`);
     console.log("new review saved");
     res.send(" new review added");
     
}));



// delete review route
router.delete("/:reviewId",wrapAsync(async (req,res)=>{
  let {id,reviewId} = req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;