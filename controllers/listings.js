const Listing = require("../models/listing");
module.exports.index=(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  });


  module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
  };

  module.exports.showListing = async (req, res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id).populate({path: "reviews",populate:{path:"author",},}).populate("owner");
      if (!listing) {
        req.flash("error", "Cannot find that listing you requested!");
        return res.redirect("/listings");
      } 
      console.log(listing);
      res.render("listings/show.ejs", { listing });
    };


    module.exports.createListing = async (req, res, next) => {
        let result = listingSchema.validate(req.body);
        console.log(result);
        if (result.error) {
          throw new ExpressError(400, result.error);
        }
        const newListing = new Listing(req.body.listing);
        
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "Successfully made a new listing!");
        res.redirect("/listings");
      };

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Cannot find that listing you requested!");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  };      

  module.exports.updateListing = async (req, res) => {
      let { id } = req.params;
      let listing = await Listing.findById(id);
  
  if (!listing.owner.equals(res.locals.currentUser._id)) {
      req.flash("error", "You do not have permission to edit this listing!");
      return res.redirect(`/listings/${id}`);
  }
      await Listing.findByIdAndUpdate(id, { ...req.body.listing });
      req.flash("success", "Successfully updated a listing!");
      res.redirect(`/listings/${id}`);
    };

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListings = await Listing.findByIdAndDelete(id);
    console.log(deletedListings);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listings");
  };