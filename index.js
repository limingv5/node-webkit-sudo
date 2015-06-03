var spawn = require("child_process").spawn;
var inpathSync = require("inpath").sync;
var pidof = require("./pidof");

var sudoBin = inpathSync("sudo");
var isWin = (process.platform == "win32");
var MSG = [
  "PID is NULL",
  "password is INVALID"
];

function _exec(command, cb) {
  cb = cb || function () {};

  var prompt = "#node-webkit-sudo-passwd#";
  var args = ["-S", "-k", "-p", prompt];
  args.push.apply(args, command);
  var child = spawn(sudoBin, args, {stdio : "pipe"});

  // Find PID
  var bin = command.filter(function (i) {
    return i.indexOf('-') !== 0;
  })[0];
  function waitForStartup(err, pid) {
    if (err) {
      throw new Error("Couldn't start " + bin);
    }

    if (pid.length || child.exitCode !== null) {
      cb(null, {pid: pid});
    }
    else {
      setTimeout(function () {
        pidof(bin, waitForStartup);
      }, 100);
    }
  }
  pidof(bin, waitForStartup);

  var prompts = 0;
  child.stderr.on("data", function (data) {
    var lines = data.toString().trim().split('\n');
    lines.forEach(function (line) {
      if (line === prompt) {
        if (++prompts > 1) {
          cb(true, {code: 1, msg: MSG[1]});
          child.stdin.write("\n\n\n\n");
        }
        else {
          child.stdin.write(Sudo.prototype.password + "\n");
        }
      }
    });
  });
}

function Sudo() {}

Sudo.prototype = {
  constructor: Sudo,
  password: '',
  setPassword: function (password) {
    Sudo.prototype.password = password || '';
  },
  check: function (cb) {
    _exec([isWin ? "ls" : "dir"], (function(i) {
      return function (err) {
        if (!i++) {
          cb(!err)
        }
      }
    })(0));
  },
  exec: function (command, cb) {
    this.check(function (valid) {
      if (valid) {
        _exec(command, cb);
      }
      else {
        cb(true, {code: 1, msg: MSG[1]});
      }
    });
  },
  killByPid: function (pid, cb) {
    if (pid) {
      pid = pid.toString();

      if (isWin) {
        this.exec(["tskill", pid], cb);
      }
      else {
        this.exec(["kill", "-9", pid], cb);
      }
    }
    else {
      cb(true, {code: 0, msg: MSG[0]});
    }
  },
  killByName: function (name, cb) {
    var self = this;
    pidof(name, function(err, pids) {
      if (pids && pids.length) {
        pids.forEach(function (pid) {
          self.killByPid(pid, cb);
        });
      }
      else {
        cb(true, {code: 0, msg: MSG[0]});
      }
    });
  }
};

module.exports = Sudo;
