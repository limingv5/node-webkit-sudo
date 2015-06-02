# node-webkit-sudo

```
var Sudo = require("node-webkit-sudo");
var sudo = new Sudo();
sudo.setPassword("PASSWORD");
sudo.exec([commands, ...], function (err, data) {
  // Logic
});
```