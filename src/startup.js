exports.checkArgs = () => {
  let args = process.argv;

  if (process.argv.length < 4) {
    console.log('\nMust provide a port and a directory!\n');
    process.exit(1);
  }

  args.shift();
  args.shift();

  let port;
  let dir;

  // Args should contain a port number and a watch directory

  if (isNaN(args[0]) && isNaN(args[1])) {
    return {start: false};
  }

  // args[0] isn't a number, so args[1] must be the port
  if (isNaN(args[0])) {
    port = parseInt(args[1]);
    dir = args[0];
  } else {
    port = parseInt(args[0]);
    dir = args[1];
  }

  console.log({dir: dir.replace(/\/$/, ''), port, start: true});

  return {dir: dir.replace(/\/$/, ''), port, start: true};
}
