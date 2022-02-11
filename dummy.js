const moment_tz = require('moment-timezone')

let a = moment_tz('10-02-2022', 'DD-MM-YYYY', true)

console.log(a)
console.log(a.isValid())