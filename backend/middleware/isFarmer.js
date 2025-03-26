const isFarmer = (req, res, next) => {
  if (req.user && req.user.role === 'farmer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Only farmers can perform this action.' });
  }
};

module.exports = isFarmer;
