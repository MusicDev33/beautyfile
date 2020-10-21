const blockedUsers = process.env.BLOCKED_USERS?.split(',');

module.exports = (req, res, next) => {
  if (!blockedUsers) {
    return next();
  }

  if (blockedUsers.includes(req.params.user)) {
    return res.sendStatus(401);
  }

  next();
}
