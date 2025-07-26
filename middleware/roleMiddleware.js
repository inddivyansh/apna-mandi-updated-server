export const isBuyer = (req, res, next) => {
  if (req.user && req.user.role === 'Buyer') next();
  else res.status(403).json({ message: 'Access denied. Buyers only.' });
};

export const isSeller = (req, res, next) => {
  if (req.user && req.user.role === 'Seller') next();
  else res.status(403).json({ message: 'Access denied. Sellers only.' });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') next();
  else res.status(403).json({ message: 'Access denied. Admins only.' });
};
