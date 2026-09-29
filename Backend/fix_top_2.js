const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const firstExp = c.indexOf("const express = require('express');");
const secondExp = c.indexOf("const express = require('express');", firstExp + 10);

if (secondExp !== -1) {
    c = c.substring(secondExp);
    fs.writeFileSync('app.js', c);
    console.log('Fixed top of app.js again');
} else {
    console.log('Could not find second express');
}

