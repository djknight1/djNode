import fs from 'fs';

export class Loader {
  loadController() {
    try {
      const dirs = fs.readdirSync(__dirname + '/controllers');
      dirs.forEach(filename => {
        require(__dirname + '/controllers/' + filename).default;
      })
    } catch (err) {
      console.log(err);
    }
  }
}
