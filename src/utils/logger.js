export default (req, _, next) => {
  console.log("Request: ", { method: req.method, endpoint: req.url });
  setTimeout(() => {
    next();
  }, 1000);
};
