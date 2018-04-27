#!/bin/bash
set -xe # Verbose output and exit with nonzero exit code if anything fails

# remember the published branch
BRANCH=`git rev-parse --abbrev-ref HEAD`

# push to origin on current branch
git push

# push force to master
git push -f origin $BRANCH:master

# checkout master and get the latest HEAD
git checkout master
git fetch origin
git reset origin/master --hard

# build the scripts
npm install
npm run build

# push a "publication" commit to master
git add -f dist node_modules/itowns/dist/itowns.js
git commit -m "publication"
git push

# come back to the published branch
git checkout $BRANCH
