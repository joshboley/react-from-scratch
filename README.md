# react-from-scratch

A demo of setting up a react app in steps (see feature branches for the steps)

## Step 1

In step 1, we will set up the project structure, webpack build, and create the App component along with the MainNav component using Bootstrap-React.

---

### Initializing the Project

1. Create the project directory `mkdir react-from-scratch`
2. (Optional) Initialize the git repo `git init`
3. Initialize npm `npm init`

### Install Webpack and Babel Dependencies:

1. Install webpack and the webpack-dev-server `npm install --save-dev webpack webpack-dev-server`
2. Install babel and it's dependencies `npm install --save-dev babel-core babel-loader babel-preset-es2015 babel-preset-react babel-preset-react-hmre`
 
### Configure Babel

1. Create a file at the project root called `.babelrc`
2. Inside the file, add the following configuration:

  ```javascript
    {
    "presets": [
        "react",
        "es2015",
        "react-hmre" // Enables hot module replacement for React components
    ],
    "ignore": "/node_modules/"
    }
  ```

### Configure Webpack

1. Create a file at the project root called `webpack.config.js`
2. Install the html-webpack-plugin (`npm install --save-dev html-webpack-plugin`).  This 
3. Inside the file add the following configuration (Note:  There are some dependencies in this file that we will install later):

  ```javascript
    const path = require('path');
    const webpack = require('webpack');
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const ExtractTextPlugin = require('extract-text-webpack-plugin');

    module.exports = {
        entry: {
            app: [
                './src/index.js',
                'webpack/hot/only-dev-server' // Enables hot reloading on this entry point
            ],
            vendor: [ // Bundle all vendor javascript together
                'react',
                'react-dom',
                'react-bootstrap',
            ],
            client: 'webpack-dev-server/client?http://localhost:8080' // Enables hot reloading via a special js bundle
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: ExtractTextPlugin.extract({ // This allows us to later use the ExtractTextPlugin to extract the css and inject in in the <head>
                        use: [ 'css-loader', 'sass-loader' ]
                    })
                },
                { 
                    test: /\.(png|woff|woff2|eot|ttf|svg)$/, // This is needed for webpack to parse the bootstrap scss files and load the font and icon files
                    loader: 'url-loader?limit=100000'
                }
            ]
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({ // This extracts the vendor bundle from the main bundle
                name: 'vendor',
                filename: '[name].bundle.js'
            }),
            new HtmlWebpackPlugin({ // This uses our index html file and injects the bundles at the end of the body tag
                template: './src/index.html',
            }),
            new ExtractTextPlugin({ // This extracts our css from the bundle and injects it in the head tag
                filename: 'styles.css',
                allChunks: true
            })
        ]
    }
  ```

### Create Index.html File

1. Create an `index.html` file inside the `/src` folder with the following content (Note:  Our Webpack configuration above will inject the css and js bundles into this "template" html file.  Our React entry point in index.js will inject the main App component into `div#root`:
  ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-type" content="text/html; charset=utf-8"/>
        <title>Sample App</title>
    </head>
    <body>
        <div id="root"></div>
    </body>
    </html>
  ```

### Setup SASS

1. We need some additional dependencies to make this work with the Webpack configuration that we defined above:
    * `npm install --save-dev bootstrap-sass css-loader extract-text-webpack-plugin node-sass resolve-url-loader sass-loader style-loader url-loader`
    * `npm install --save react-bootstrap`
2. At the project root, create a `bootstrap.config.scss` file.  We will use this to set bootstrap sass variables and import bootstrap.  Then, we will import this file into our index.scss.
3. Create an `index.scss` file inside the `/src` folder with the following content:
  ```scss
  @import '../bootstrap.config';

  // Import other global styles here
  ```

### Create Root App Component

1. Create a components directory `mkdir components`
2. Create an `app.js` file inside the `components` directory
3. Add the following code:
  ```javascript
    import React, { Component } from 'react';

    // We ill create this component next
    import MainNav from './main-nav';

    export default class App extends React.Component {
        render() {
            return (
                <MainNav />
            );
        }
    }
  ```

### Create Main Nav Component

1. Create a `main-nav.js` file inside the `components` directory
2. Add the following code:
  ```javascript
    import React, { Component } from 'react';
    // Import react bootstrap components for the navbar
    import { Navbar, FormGroup, FormControl } from 'react-bootstrap';

    export default class MainNav extends React.Component {
        render() {
            return (
                <Navbar collapseOnSelect>
                    <Navbar.Header>
                        <Navbar.Brand>
                            To-Do List
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>
                        <Navbar.Form pullRight>
                            <FormGroup>
                                <FormControl type="text" placeholder="Search" />
                            </FormGroup>
                        </Navbar.Form>
                    </Navbar.Collapse>
                </Navbar>
            );
        }
    }
  ```

### Bootstrap the App

1. Create an `index.js` file at the app root (`/src`)
2. Add the following code:
  ```javascript
    import './index.scss';

    import React from 'react';
    import ReactDOM from 'react-dom';

    import App from './components/app';

    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
  ```

### Create NPM Scripts

1. Add the following scripts to your `package.json`:
  ```javascript
    ... // More json here (removed for brevity)
    "scripts": {
        "compile": "webpack",
        "start:dev": "webpack-dev-server --hot --inline"
    },
    ... // More json here
  ```

### Run the App

1. `npm run start:dev`