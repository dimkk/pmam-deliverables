pmam-deliverables
=======

This is the primary repository for PM-Ammo's budget and finance tools created and maintained by ESED.

Install the required tools
---------
[Install NodeJS](http://nodejs.org/): 
Node provides the framework for all other project components.

[Install Git](http://git-scm.com/): 
Open source version control system.

Open terminal and install [Gulp](http://gulpjs.com/):

    npm install --global gulp
    
Next install [Bower](http://bower.io/), our package manager:

    npm install -g bower

Cloning the Repository
---------
Navigate to the local folder on your computer where OneApp will reside and clone the repo using PowerShell:

    git clone https://github.com/scatcher/pmam-deliverables.git

Installing Dependencies
---------
Install the required node modules

    npm install

Install project dependencies (gets everything identified in bower.json)

    bower install

Post-Setup
---------
To see your code in the browser using gulp

    gulp serve
    
Prepare code for SharePoint
---------
Gulp will concat and minify our code.  The output of this process is put into the /dist folder.

    gulp build


Update our dependencies
---------
We can either update all dependencies

    bower update
    
or update a specific dependency

    bower update PackageName
    

Run unit tests
---------
Run a single unit test

    gulp test
       
or run continuous tests whenever a file is changed

    gulp autotest
    
or to debug a test

    gulp debugtest
    
      
Code Style
---------
John Papa's [Angular JS Guide](https://github.com/johnpapa/angularjs-styleguide) guide should be referenced for all
style and structure guidance.


Working Offline
---------
 All cached XML requests should be stored in "./xml-cache/", named to match the list.  So as an example offline data
 for a list named Projects would be "./xml-cache/Projects.xml".
    
    
    
