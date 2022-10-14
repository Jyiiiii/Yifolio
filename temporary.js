const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "1111";

const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

console.log(hash);
