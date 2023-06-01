const User = require("../models/User");
const isAuthenticated = async (req, res, next) => {
  // Le token reçu est dans req.headers.authorization
  // console.log("my token: " + req.headers.authorization);

  try {
    if (req.headers.authorization) {
      // console.log(req.headers.authorization);
      //   Je vais chercher mon token et j'enlève "Bearer " devant
      const token = req.headers.authorization.replace("Bearer ", "");
      // console.log(token);
      //   Je vais chercher en BDD un user dont le token est dans ma variable token
      const user = await User.findOne({ token: token });
      // console.log(user);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//   // Si je n'en trouve pas ====> erreur // if (!req.headers.autorisation)
//   if (!user) {
//     return res.status(401).json({
//       message: "Unauthorized",
//     });
//   }

//   // Si J'en trouve un, je le stocke dans req.user pour le garder sous la main et pouvoir le réutiliser dans ma route
//   req.user = user;
//   // Je passe au middleware suivant
//   next();
// };

module.exports = isAuthenticated;
