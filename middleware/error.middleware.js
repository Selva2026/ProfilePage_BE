export const errorHandler = (err, req, res, next) => {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        errors: err.inner.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
  
    res.status(500).json({ message: err.message || "Server Error" });
  };
  