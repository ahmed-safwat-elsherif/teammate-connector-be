import User from "../models/user.js";
import userRoles from "../utils/userRoles.js";

export default  async (req, res, next) => {
  try {
    const {username} = req.user || {};
    if (!username) {
      return res.status(401).json({message:"Process is unauthorized!"});
    }
    const user = await User.findOne({where:{username}});
    const {role} = user.toJSON();
    if(role !== userRoles.ADMIN){
      return res.status(401).json({message:"Process is unauthorized"});
    }
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
