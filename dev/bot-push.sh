#!/bin/bash 

branch=$1

git checkout -b $branch 
git config user.name "github-actions[bot]"
git config user.email "github-actions-bot@users.noreply.github.com"
git add .
git commit -m "Automated update"
git push origin $branch --force 

