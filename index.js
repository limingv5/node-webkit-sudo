var spawn = require("child_process").spawn;
var pidof = require("pidof");
var inpathSync = require("inpath").sync;
var sudoBin = inpathSync("sudo", process.env["PATH"].split(':'));
var isWin = process.platform == "win32";

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

    if (pid || child.exitCode !== null) {
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
          cb(true, {msg: "password invalid!"});
          child.stdin.write("\n\n\n\n");
        }
        else {
          child.stdin.write(Sudo.prototype.password + "\n");
        }
      }
    });
  });
}

function Sudo() {

}

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
        cb(true);
      }
    }.bind(this));
  },
  killByPid: function (pid, cb) {
    pid = pid.toString();

    if (isWin) {
      this.exec(["tskill", pid], cb);
    }
    else {
      this.exec(["kill", "-9", pid], cb);
    }
  },
  killByName: function (name, cb) {
    pidof(name, function(err, pid) {
      this.killByPid(pid, cb);
    }.bind(this));
  }
};

module.exports = Sudo;
