# NodeJS MVC Skeleton

This repo is a MVC skeleton for a web application that uses the M*EAN stack(*MySQL, ExpressJS, AngularJS, NodeJS).

## Quick start
1. First of all clone the repository `git clone https://github.com/bushev/nodejs-mvc-skeleton.git`.
2. Go into the repository `cd nodejs-mvc-skeleton`.
3. Install dependencies with NPM `npm install`. 
4. Go into the repository `cd nodejs-mvc-skeleton/resources`.
5. Install dependencies with Bower `bower install`. (you must have `bower` globally installed)
6. Plug in your API key for [mandrill](https://www.mandrill.com/), see `nodejs-mvc-skeleton/config/local.json`.
7. Set up new database, see `nodejs-mvc-skeleton/config/local.json`

That's all! Now go and open up your browser at [http://localhost:8080](http://localhost:8080), and make something awesome!

## Prerequisites
- Node.js - Download and Install Node.js. You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm
- MySQL - Download and Install MySQL - Make sure it's running on the default port (3306).

### Tool Prerequisites
- NPM - Node.js package manager, should be installed when you install node.js. NPM (Node Package Manager) will look at the [package.json](https://github.com/bushev/nodejs-mvc-skeleton/blob/master/package.json) file in the root of the project and download all of the necessary dependencies and put them in a folder called ```node_modules```

- Bower - Web package manager, installing Bower is simple when you have npm:
``` npm install -g bower ```

### NPM Modules Used
- [Sequelize](http://sequelizejs.com/) is a library provides easy access to MySQL, MariaDB, SQLite or PostgreSQL databases by mapping database entries to objects and vice versa.  
- [Passport](http://passportjs.org/) is a authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application. A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, and more.
- [mandrill](https://www.mandrill.com/) is a reliable, scalable, and secure delivery API for transactional emails from websites and applications. 

### Front-End Frameworks Used
- [AngularJS](http://angularjs.org/) is an open-source JavaScript framework, maintained by Google, that assists with running single-page applications. Its goal is to augment browser-based applications with model–view–controller (MVC) capability, in an effort to make both development and testing easier.
- [Twitter Bootstrap 3](http://getbootstrap.com/) the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.

### Troubleshooting and Contact
Please, feel free to submit new issues!