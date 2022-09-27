let router = require('express').Router();
let passport = require('passport');

//authentication with google
router.get("/google", passport.authenticate("google", { scope: ["profile"]}));

//redirect URL for authenticated google users
router.get("/callbackURL", passport.authenticate("google"), (req, res) => {
  res.redirect('/homepage');
});


module.exports = router;