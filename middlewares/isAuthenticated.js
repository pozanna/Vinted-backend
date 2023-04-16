const User = require("../models/User");
const isAuthenticated = async (req, res, next) => {
  // Le token reçu est dans req.headers.authorization
  console.log(req.headers.authorization);
  //   Je vais chercher mon token et j'enlève "Bearer " devant
  const token = req.headers.authorization.replace("Bearer ", "");

  //   Je vais chercher en BDD un user dont le token est dans ma variable token
  const user = await User.findOne({ token: token });

  // Si je n'en trouve pas ====> erreur // if (!req.headers.autorisation)
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Si J'en trouve un, je le stocke dans req.user pour le garder sous la main et pouvoir le réutiliser dans ma route
  req.user = user;
  // Je passe au middleware suivant
  next();
};

module.exports = isAuthenticated;
