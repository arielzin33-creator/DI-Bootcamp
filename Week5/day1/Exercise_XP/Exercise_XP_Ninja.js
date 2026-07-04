//Exercise 2: Analyze — Promise.all() with a delayed start

let resolveAfter2Seconds = function() {
    console.log("starting slow promise");
    return new Promise(resolve => {
        setTimeout(function() {
            resolve("slow");
            console.log("slow promise is done");
        }, 2000);
    });
};

let resolveAfter1Second = function() {
    console.log("starting fast promise");
    return new Promise(resolve => {
        setTimeout(function() {
            resolve("fast");
            console.log("fast promise is done");
        }, 1000);
    });
};

//The Promise.all() method returns a single Promise that fulfills when all of the promises passed as an iterable have been fulfilled.

let concurrentPromise = function() {
    console.log('==CONCURRENT START with Promise.all==');
    return Promise.all([resolveAfter2Seconds(), resolveAfter1Second()]).then((messages) => {
        console.log(messages[0]);
        console.log(messages[1]);
    });
}

setTimeout(concurrentPromise, 1000)

// (... 1 second passes ...)
// CONCURRENT START with Promise.all
// starting slow promise
// starting fast promise
// (... 1 second passes (2s total from start) ...)
// fast promise is done
// (... 1 more second passes (3s total from start) ...)
// slow promise is done
// slow
// fast

//Exercise 3: Analyze — async/await with Promise.all() and IIFEs

let resolveAfter2Seconds = function() {
    console.log("starting slow promise");
    return new Promise(resolve => {
        setTimeout(function() {
            resolve("slow");
            console.log("slow promise is done");
        }, 2000);
    });
};

let resolveAfter1Second = function() {
    console.log("starting fast promise");
    return new Promise(resolve => {
        setTimeout(function() {
            resolve("fast");
            console.log("fast promise is done");
        }, 1000);
    });
};

let parallel = async function() {
    console.log('==PARALLEL with await Promise.all==');
    // Start 2 "jobs" in parallel and wait for both of them to complete
    await Promise.all([
        (async() => console.log(await resolveAfter2Seconds()))(),
        (async() => console.log(await resolveAfter1Second()))()
    ]);
}

setTimeout(parallel, 5000)

// (... 5 seconds pass ...)
// PARALLEL with await Promise.all
// starting slow promise
// starting fast promise
// (... 1 second passes (6s total) ...)
// fast promise is done
// fast
// (... 1 more second passes (7s total) ...)
// slow promise is done
// slow

//Exercise 4: Analyze — Parallel with .then(), no await

let resolveAfter2Seconds = function() {
    console.log("starting slow promise");
    return new Promise(resolve => {
        setTimeout(function() {
            resolve("slow");
            console.log("slow promise is done");
        }, 2000);
    });
};

let resolveAfter1Second = function() {
    console.log("starting fast promise");
    return new Promise(resolve => {
        setTimeout(function() {
            resolve("fast");
            console.log("fast promise is done");
        }, 1000);
    });
};

// This function does not handle errors. See warning below!
let parallelPromise = function() {
    console.log('==PARALLEL with Promise.then==');
    resolveAfter2Seconds().then((message) => console.log(message));
    resolveAfter1Second().then((message) => console.log(message));
}

setTimeout(parallelPromise, 13000)

// (... 13 seconds pass ...)
// PARALLEL with Promise.then
// starting slow promise
// starting fast promise
// (... 1 second passes (14s total) ...)
// fast promise is done
// fast
// (... 1 more second passes (15s total) ...)
// slow promise is done
// slow