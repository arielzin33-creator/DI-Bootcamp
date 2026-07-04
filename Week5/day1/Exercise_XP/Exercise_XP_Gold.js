//Exercise 2: Analyze — Sequential Await

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

let sequentialStart = async function() {
    console.log('==SEQUENTIAL START==');
    const slow = await resolveAfter2Seconds();
    console.log(slow);
    const fast = await resolveAfter1Second();
    console.log(fast);
}

sequentialStart()


// SEQUENTIAL START 
// starting slow promise(...2 seconds pass...)
// slow promise is done
// slow
// starting fast promise
// (...1 second passes...)
// fast promise is done
// fast

//Exercise 3: Analyze — Concurrent Await

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

let concurrentStart = async function() {
    console.log('==CONCURRENT START with await==');
    const slow = resolveAfter2Seconds();
    const fast = resolveAfter1Second();
    console.log(await slow);
    console.log(await fast);
}

setTimeout(concurrentStart, 4000)

// (... 4 seconds pass — nothing logged yet ...)
// CONCURRENT START with await
// starting slow promise
// starting fast promise
// (... 1 second passes ...)
// fast promise is done
// (... 1 more second passes (2s total) ...)
// slow promise is done
// slow
// fast

//Exercise 4 : Modify fetch with Async/Await

const urls = [
    "https://jsonplaceholder.typicode.com/users",
    "https://jsonplaceholder.typicode.com/posts",
    "https://jsonplaceholder.typicode.com/albums"
];

const getData = async function() {
    try {
        const [users, posts, albums] = await Promise.all(
            urls.map(async(url) => {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                return await response.json();
            })
        );

        console.log('users', users);
        console.log('posts', posts);
        console.log('albums', albums);

    } catch (error) {
        console.log('ooooooops');
        console.error(error);
    }
};

getData();