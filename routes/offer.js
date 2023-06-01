const express = require("express");
const cloudinary = require("cloudinary").v2; // после того как сделала new Offer
// Import de fileupload qui nous permet de recevoir des formdata
const fileUpload = require("express-fileupload");
const router = express.Router();
// Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");
const Offer = require("../models/Offer.js");
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Fonction qui permet de transformer nos fichier qu'on reçois sous forme de Buffer en base64 afin de pouvoir les upload sur cloudinary
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(req.headers.authorization);
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const userCreatingOffer = req.user;

      // console.log(req.body);
      // console.log("req.files : ", req.files);

      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: "/vinted",
        }
      );

      //  console.log(result);
      //console.log(result);

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: Number(price),
        product_details: [
          // un tableu
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAIT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        owner: req.user._id,
        // product_image: { secure_url: result.secure_url },
        // owner: {
        //   account: {
        //     username: userCreatingOffer.account.username,
        //     avatar: {},
        //   },
        //   _id: userCreatingOffer._id,
        // },
      });
      console.log(newOffer);
      await newOffer.save();
      res.status(201).json(newOffer);

      // J'ai accès à req.user. Clef que j'ai stockée dans req dans le middleware isAuthenticated
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      //console.log(typeof req.query.priceMin);
      filters.product_price = {
        $gte: Number(req.query.priceMin),
      };
    }
    if (req.query.priceMax) {
      // filters.product_price = {
      //   $lte: Number(req.query.priceMax),
      // };
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = {
          $lte: Number(req.query.priceMax),
        };
      }
    }

    //console.log(filters.product_price);

    const sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = -1; //"desc"
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1;
    } // "asc"

    let limit = 5;
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    // 10 res par page 1: skip 0, page 2: skip 10, page 3: skip 20
    // 3 res par page 1: skip 0, page 3: skip 10, page 3:skip 6

    const skip = (page - 1) * limit;

    const results = await Offer.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    //.select("product_name product_price -_id"); убрали это

    // destructure page and limit and set default values
    // const { title, priceMin, priceMax, sort, page } = req.query;
    // const pageLimit = 5;

    // const offers = await Offer.find({
    //   product_name: new RegExp(title, "i"),
    //   product_price: { $gte: priceMin, $lte: priceMax },
    // });

    // .limit(pageLimit * 1)
    // .skip((page - 1) * pageLimit)
    // .exec()

    //const regexp = /T-shirt/i;
    //const regexp = new RegExp("bleu", "i");
    // const offers = await Offer.find({ product_name: regexp }).select(
    //   "product_name product_price -_id"
    // );
    const count = await Offer.countDocuments(filters);
    res.json(
      { count: count, offers: results }

      // count: pageLimit,
      // offers: offersPage,
    );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
