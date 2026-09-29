import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const token = req.get('Authorization');

  if (!token) {
    return res.status(401).send({error: 'No token provided'});
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    req.user_id = payload.id;
    next();
  } catch (error) {
    return res.status(401).send({
      error: 'Invalid token',
    })
  }
}
