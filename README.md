# node-webkit-sudo

```
var Sudo = require("node-webkit-sudo");
var sudo = new Sudo();
sudo.setPassword("PASSWORD");
```

## check

> check whether the PASSWORD is valid

```
sudo.check(function (valid) {

});
```

## exec

> exec the commands

```
sudo.exec([commands, ...], function (err, data) {

});
```

## killByPid

> kill the process by PID

```
sudo.killByPid(pid, function (err, data) {

});
```

## killByName

> kill the process by Process Name

```
sudo.killByName(name, function (err, data) {

});
```