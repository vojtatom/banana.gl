#!/bin/bash

echo "Please specify version number (e.g. 1.0.0):"
while read version; do
    version_checked=$(echo $version | sed -e '/^[0-9]*\.[0-9]*\.[0-9]*$/d')
    if [[ -z $version_checked ]]; then
        echo "Deploying version $version..."
        break
    else
        echo "$version_checked is not in the right format, please use XX.XX.XX format (ie: 4.15.3)"
    fi
done

append "v" to version number
version="v$version"
git tag $version
git push origin --tags



