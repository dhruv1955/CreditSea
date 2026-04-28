const bcrypt = require('bcrypt');

const hash = '$2b$10$x33lxRP51KfzNxB7zpGcbuiJ3U3uZL1seLaqGwPsVQZKTooOt2uLG';
const password = 'Borrower@123';

bcrypt.compare(password, hash).then((res) => {
  console.log('bcrypt.compare result:', res);
}).catch((err) => {
  console.error('bcrypt error', err);
});
