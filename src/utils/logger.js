
const routesLogsBlackList = [
  "/sync/progress"
]
export default (req, _, next) => {
  const {method,url:endpoint}  = req;
  if(!routesLogsBlackList.includes(endpoint)) {
    console.log("Request: ", { method, endpoint });
  }
  next();
};
