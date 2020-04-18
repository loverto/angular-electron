const child_process_1 = require("child_process");




function main() {
    let storePath = process.env.storePath;
    child_process_1.fork("src/main/crd3m.js",{env: {storePath:storePath}})
}

main();
