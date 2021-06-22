### Warning

There is a `.env.default` file that adds `root` to the list of banned users. DO NOT REMOVE THIS UNLESS YOU KNOW WHAT YOU'RE DOING!

### To Run

To run BeautyFile, you just need to add a watch directory and a port number like so:

`node src/index.js /home/username/pictures 8080`

Or you can use `pm2 start myconfig.config.json`. An example config is given in `local.config.json`
