// Import the router module
const indexRouter = require('./routes/index');

// Mount the router at a specific path
app.use('/', indexRouter);

app.listen(5000, () => {
    console.log('server is listening on port 5000')
})