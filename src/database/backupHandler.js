const scheduler = require('node-schedule');
const shell = require('shelljs');
console.log('running backups with shelljs');

scheduler.scheduleJob({hour: 13, minute: 5, dayOfWeek: [1,2,3,4,5]}, () =>{
  if (shell.find('../backups').code === 0) {
    shell.exec('mongodump --db assistant --out ../backups/backups-`date +"%y-%m-%d-%H:%M"`');
  } else {
    shell.mkdir('../backups');
    shell.exec('mongodump --db assistant --out ../backups/backups-`date +"%y-%m-%d-%H:%M"`');
  }
});

scheduler.scheduleJob({hour: 13, minute: 0, dayOfWeek: [1,2,3,4,5]}, () =>{
  shell.exec('find ../backups/ -mtime +7 -exec rm -rf {} \\;');
});
