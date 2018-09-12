const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission')
  }

  const hash = bcrypt.hashSync(password);
  /**
   * Create a transaction and insert it into login.
   *  Return the email then use the loginEmail to
   * return another trx transaction that inserts into the users.
   */
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into("login")
      .returning("email")
      .then(loginEmail => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          });
      })
      .then(trx.commit) // Commit inserted transactions
      .catch(trx.rollback); // Rollback changes if failed
  })
    .catch(err => res.status(400).json("unable to register"));
  //Take users and insert information, then return ALL (*) columns
};
module.exports = {
  handleRegister: handleRegister
} 