#!/bin/bash

get_current_version() {
    local package_json=$1
    if [ -f "$package_json" ]; then
        grep '"version":' "$package_json" | cut -d\" -f4
    else
        echo "Error: package.json not found at $package_json"
        exit 1
    fi
}

if [ -n "$(git status --porcelain)" ]; then
    echo "Error: There are uncommitted changes in the working directory"
    echo "Please commit or stash these changes before proceeding"
    exit 1
fi

update_version() {
    local package_dir=$1
    local version_type=$2

    case $version_type in
        "patch")
            pnpm version patch --no-git-tag-version
            ;;
        "minor")
            pnpm version minor --no-git-tag-version
            ;;
        "major")
            pnpm version major --no-git-tag-version
            ;;
        *)
            echo "Invalid version type. Please choose patch/minor/major"
            exit 1
            ;;
    esac
}

echo "Starting package version management..."

root_package_json="./package.json"
current_version=$(get_current_version "$root_package_json")

echo ""
echo "Current version: $current_version"
echo ""

read -p "Update version? (patch/minor/major): " version_type
echo ""

update_version "." "$version_type"

new_version=$(get_current_version "$root_package_json")

echo "Updating lock file..."
pnpm i

echo "Staging package.json files..."
git add "package.json"
echo ""

echo "Committing version changes..."
git commit -m "v$new_version"
echo ""

echo ""
echo "Creating git tag: v$new_version"
git tag "v$new_version"
git push --tags
echo ""

echo "Running release process..."
pnpm publish
echo ""

echo "Released!"
