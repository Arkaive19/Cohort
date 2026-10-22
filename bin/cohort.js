#!/usr/bin/env node
import {createRequire} from "module"
const require = createRequire(import.meta.url)
const {version} = require("../package.json")

const args = process.argv.slice(2);

if (args.length > 3){
    console.log("Usage: \n $ cohort OPTION HELPER")
    process.exit(0)
}

if (args.length == 0){
   console.log(`Cohort, a Multi Instance Launcher CLI tool for Sober ${version}`)
}


const [option,helper] = args;


if (option == "--help" || option == "--h"){
    console.log(`Cohort, a Multi Instance Launcher CLI tool for Sober ${version}`)
}

if (option == "--version" || option == "--v"){
    console.log(version);
}

