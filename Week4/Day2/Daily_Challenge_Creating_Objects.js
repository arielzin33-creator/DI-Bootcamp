class Video {
    constructor(title, uploader, time) {
        this.title = title, this.uploader = uploader, this.time = time
    }


    watch() {
        return `${this.uploader} watched all ${this.time} seconds of ${this.title}!`
    }
}
const videoReview = new Video('Marvels', 'Ariel', '50000')
console.log(videoReview.watch());

const videoReview2 = new Video('Terminator', 'Afori', '120000')
console.log(videoReview2.watch());

const videosData = [{
    title: 'JavaScript Tutorial',
    uploader: 'John',
    time: 3600
}, {
    title: 'CSS Crash Course',
    uploader: 'Sarah',
    time: 2700
}, {
    title: 'React for Beginners',
    uploader: 'Mike',
    time: 5400
}, {
    title: 'Node.js Fundamentals',
    uploader: 'Emma',
    time: 4800
}, {
    title: 'Python Basics',
    uploader: 'David',
    time: 3200
}];

videosData.forEach(data => {
    const video = new Video(data.title, data.uploader, data.time);
    console.log(video.watch());
})